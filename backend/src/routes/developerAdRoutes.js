import express from 'express';
import {
  getAdSettings,
  updateAdSettings,
  getAdAuditLog,
} from '../controllers/adSettingsController.js';
import { protect, developerOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require login + developer role
router.use(protect, developerOnly);

router.get('/settings',   getAdSettings);
router.put('/settings',   updateAdSettings);
router.get('/audit-log',  getAdAuditLog);

export default router;
