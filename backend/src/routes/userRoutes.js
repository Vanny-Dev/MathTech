import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/profile',    protect, getUserProfile);
router.put('/profile',    protect, updateUserProfile);
router.put('/password',   protect, changePassword);
router.delete('/profile', protect, deleteUserAccount);

export default router;
