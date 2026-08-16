import express from 'express';
import {
  getAllStudents,
  getModuleProgress,
  getStudentDetail,
  getClassSummary,
} from '../controllers/teacherController.js';
import { protect, teacherOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require login + teacher role
router.use(protect, teacherOnly);

router.get('/students',                              getAllStudents);
router.get('/monitor/:moduleId',                     getModuleProgress);
router.get('/monitor/:moduleId/student/:studentId',  getStudentDetail);
router.get('/monitor/:moduleId/summary',             getClassSummary);

export default router;
