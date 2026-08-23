import express from 'express';
import {
  getScore,
  getCorrectAnswers,
  getIncorrectAnswers,
  getLatestSubmission,
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Declared before the :submissionId route so "latest" is never read as an id
router.get('/latest/:moduleId',         protect, getLatestSubmission);

router.get('/:submissionId',            protect, getScore);
router.get('/:submissionId/answers',    protect, getCorrectAnswers);
router.get('/:submissionId/incorrect',  protect, getIncorrectAnswers);

export default router;
