import express from 'express';
import {
  getProgress,
  markSectionComplete,
  getPerformanceSummary,
  getCompletedActivities,
  getMyProgress,
  markActivityStarted,
} from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Literal segments before the :moduleId route so they are not read as ids
router.get('/completed',              protect, getCompletedActivities);
router.get('/mine',                   protect, getMyProgress);
router.get('/:moduleId',              protect, getProgress);
router.put('/:moduleId/section',      protect, markSectionComplete);
router.put('/:moduleId/activity-started', protect, markActivityStarted);
router.get('/:moduleId/summary',      protect, getPerformanceSummary);

export default router;
