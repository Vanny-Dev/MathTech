import express from 'express';
import {
  getActivities,
  submitAnswers,
  createActivity,
  updateActivity,
  deleteActivity,
} from '../controllers/activityController.js';
import { protect, teacherOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Reads / student submission — release gating is enforced per handler
router.get('/',        protect, getActivities);
router.post('/submit', protect, submitAnswers);

// Authoring — teachers only
router.post('/',       protect, teacherOnly, createActivity);
router.put('/:id',     protect, teacherOnly, updateActivity);
router.delete('/:id',  protect, teacherOnly, deleteActivity);

export default router;
