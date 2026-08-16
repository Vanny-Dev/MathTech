import express from 'express';
import {
  getModules,
  getModuleById,
  getObjectives,
  getCompetencies,
  getLesson,
  createModule,
  updateModule,
  setReleaseDate,
} from '../controllers/moduleController.js';
import { protect, teacherOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Reads — any logged-in user; release gating is enforced per handler
router.get('/',                 protect, getModules);
router.get('/:id',              protect, getModuleById);
router.get('/:id/objectives',   protect, getObjectives);
router.get('/:id/competencies', protect, getCompetencies);
router.get('/:id/lesson',       protect, getLesson);

// Writes — teachers only
router.post('/',            protect, teacherOnly, createModule);
router.put('/:id',          protect, teacherOnly, updateModule);
router.put('/:id/release',  protect, teacherOnly, setReleaseDate);

export default router;
