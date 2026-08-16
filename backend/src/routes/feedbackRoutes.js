import express from 'express';
import {
  getScore,
  getCorrectAnswers,
  getIncorrectAnswers,
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:submissionId',            protect, getScore);
router.get('/:submissionId/answers',    protect, getCorrectAnswers);
router.get('/:submissionId/incorrect',  protect, getIncorrectAnswers);

export default router;
