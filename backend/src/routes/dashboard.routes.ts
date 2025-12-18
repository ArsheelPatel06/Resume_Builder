import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getDashboardStats, getRecentActivity } from '../controllers/dashboard.controller';

const router = Router();

router.get('/stats', authenticateToken, getDashboardStats);
router.get('/recent', authenticateToken, getRecentActivity);

export default router;
