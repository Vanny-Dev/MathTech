import express from 'express';
import { getPublicAdSettings } from '../controllers/adController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Any authenticated user (student or teacher) can read the current ad
// configuration — it's what their own client uses to decide whether to render
// advertisements at all.
router.use(protect);

router.get('/settings', getPublicAdSettings);

export default router;
