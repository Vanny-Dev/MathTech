import Reflection from '../models/Reflection.js';
import Module from '../models/Module.js';
import { denyIfLocked } from '../utils/release.js';

const MAX_LENGTH = 5000;

// @desc    Get the signed-in student's reflection for one module
// @route   GET /api/reflections/:moduleId
// @access  Private
export const getMyReflection = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId).select('isPublished releaseDate title');
    if (denyIfLocked(res, req.user, module)) return;

    const reflection = await Reflection.findOne({
      userId: req.user._id,
      moduleId,
    });

    // Not having written one yet is normal, not an error
    res.json(
      reflection
        ? {
            content:   reflection.content,
            createdAt: reflection.createdAt,
            updatedAt: reflection.updatedAt,
          }
        : { content: '', createdAt: null, updatedAt: null }
    );
  } catch (err) {
    next(err);
  }
};

// @desc    Create or update the reflection. Editable at any time.
// @route   PUT /api/reflections/:moduleId
// @access  Private
export const saveMyReflection = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const content = (req.body?.content ?? '').trim();

    if (!content) {
      return res.status(400).json({ message: 'Reflection cannot be empty' });
    }
    if (content.length > MAX_LENGTH) {
      return res.status(400).json({
        message: `Reflection is too long (${content.length}/${MAX_LENGTH} characters)`,
      });
    }

    const module = await Module.findById(moduleId).select('isPublished releaseDate title');
    if (denyIfLocked(res, req.user, module)) return;

    // upsert: first save creates it, every later save edits the same document
    const reflection = await Reflection.findOneAndUpdate(
      { userId: req.user._id, moduleId },
      { $set: { content } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({
      content:   reflection.content,
      createdAt: reflection.createdAt,
      updatedAt: reflection.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete the reflection
// @route   DELETE /api/reflections/:moduleId
// @access  Private
export const deleteMyReflection = async (req, res, next) => {
  try {
    await Reflection.findOneAndDelete({
      userId: req.user._id,
      moduleId: req.params.moduleId,
    });
    res.json({ message: 'Reflection deleted' });
  } catch (err) {
    next(err);
  }
};
