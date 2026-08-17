import express from 'express';
import {
  getMyReflection,
  saveMyReflection,
  deleteMyReflection,
} from '../controllers/reflectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// A reflection always belongs to the signed-in user; the id never comes from
// the client, so one student cannot read or edit another student's writing.
router.get('/:moduleId',    protect, getMyReflection);
router.put('/:moduleId',    protect, saveMyReflection);
router.delete('/:moduleId', protect, deleteMyReflection);

export default router;
