import express from 'express';
import {
  getProgress,
  markSectionComplete,
  getPerformanceSummary,
  getCompletedActivities,
} from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/completed',              protect, getCompletedActivities);
router.get('/:moduleId',              protect, getProgress);
router.put('/:moduleId/section',      protect, markSectionComplete);
router.get('/:moduleId/summary',      protect, getPerformanceSummary);

export default router;
