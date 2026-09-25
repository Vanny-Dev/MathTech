import express from 'express';
import {
  getAllStudents,
  getModuleProgress,
  getStudentDetail,
  getClassSummary,
  deleteStudents,
  resetStudentCode,
  issueMissingCodes,
} from '../controllers/teacherController.js';
import { protect, teacherOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require login + teacher role
router.use(protect, teacherOnly);

router.get('/students',                              getAllStudents);
router.post('/students/delete',                      deleteStudents);
router.post('/students/codes/issue',                 issueMissingCodes);
router.post('/students/:studentId/code',             resetStudentCode);
router.get('/monitor/:moduleId',                     getModuleProgress);
router.get('/monitor/:moduleId/student/:studentId',  getStudentDetail);
router.get('/monitor/:moduleId/summary',             getClassSummary);

export default router;
