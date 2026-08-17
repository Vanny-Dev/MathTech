import Module from '../models/Module.js';
import { isReleased, isTeacher, denyIfLocked } from '../utils/release.js';

// Shape a module for the module list. Students always learn the release date
// (so the UI can show a countdown) but never the content of a locked topic.
const toListItem = (m, user) => ({
  _id:         m._id,
  title:       m.title,
  subject:     m.subject,
  gradeLevel:  m.gradeLevel,
  quarter:     m.quarter,
  week:        m.week,
  topicNumber: m.topicNumber,
  releaseDate: m.releaseDate,
  isReleased:  isReleased(m),
  ...(isTeacher(user) ? { isPublished: m.isPublished } : {}),
});

// @desc    Get modules. Teachers see every module (including drafts and
//          unreleased ones); students see published modules only, each
//          flagged with whether it has been released yet.
// @route   GET /api/modules
// @access  Private
export const getModules = async (req, res, next) => {
  try {
    const filter = isTeacher(req.user) ? {} : { isPublished: true };

    // Always curriculum order. Sorting by releaseDate would reshuffle the whole
    // list every time a teacher schedules a topic, so Week 1 Topic 1 would stop
    // being first. createdAt is the tie-break for modules with no week set.
    const modules = await Module.find(filter)
      .select('title subject gradeLevel quarter week topicNumber releaseDate isPublished')
      .sort({ week: 1, topicNumber: 1, createdAt: 1 });

    res.json(modules.map((m) => toListItem(m, req.user)));
  } catch (err) {
    next(err);
  }
};

// @desc    Get single module (full content)
// @route   GET /api/modules/:id
// @access  Private
export const getModuleById = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id);
    if (denyIfLocked(res, req.user, module)) return;
    res.json(module);
  } catch (err) {
    next(err);
  }
};

// @desc    Get module learning objectives
// @route   GET /api/modules/:id/objectives
// @access  Private
export const getObjectives = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id).select(
      'objectives isPublished releaseDate title'
    );
    if (denyIfLocked(res, req.user, module)) return;
    res.json(module.objectives);
  } catch (err) {
    next(err);
  }
};

// @desc    Get module competencies
// @route   GET /api/modules/:id/competencies
// @access  Private
export const getCompetencies = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id).select(
      'competencies isPublished releaseDate title'
    );
    if (denyIfLocked(res, req.user, module)) return;
    res.json(module.competencies);
  } catch (err) {
    next(err);
  }
};

// @desc    Get module lesson content (discussion, concepts, examples)
// @route   GET /api/modules/:id/lesson
// @access  Private
export const getLesson = async (req, res, next) => {
  try {
    const module = await Module.findById(req.params.id).select(
      'discussion concepts examples isPublished releaseDate title'
    );
    if (denyIfLocked(res, req.user, module)) return;
    res.json({
      discussion: module.discussion,
      concepts:   module.concepts,
      examples:   module.examples,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a module
// @route   POST /api/modules
// @access  Private (Teacher only)
export const createModule = async (req, res, next) => {
  try {
    const module = await Module.create(req.body);
    res.status(201).json(module);
  } catch (err) {
    next(err);
  }
};

// @desc    Update a module
// @route   PUT /api/modules/:id
// @access  Private (Teacher only)
export const updateModule = async (req, res, next) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!module) return res.status(404).json({ message: 'Module not found' });
    res.json(module);
  } catch (err) {
    next(err);
  }
};

// @desc    Schedule when a topic becomes available to students.
//          Send { releaseDate: null } to remove the schedule (open immediately).
// @route   PUT /api/modules/:id/release
// @access  Private (Teacher only)
export const setReleaseDate = async (req, res, next) => {
  try {
    const { releaseDate } = req.body;

    let value = null;
    if (releaseDate !== null && releaseDate !== undefined && releaseDate !== '') {
      const parsed = new Date(releaseDate);
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ message: 'releaseDate must be a valid date' });
      }
      value = parsed;
    }

    const module = await Module.findByIdAndUpdate(
      req.params.id,
      { releaseDate: value },
      { new: true, runValidators: true }
    ).select('title releaseDate isPublished');

    if (!module) return res.status(404).json({ message: 'Module not found' });

    res.json({
      _id:         module._id,
      title:       module.title,
      releaseDate: module.releaseDate,
      isPublished: module.isPublished,
      isReleased:  isReleased(module),
    });
  } catch (err) {
    next(err);
  }
};
