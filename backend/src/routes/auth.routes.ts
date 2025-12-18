import { Router } from 'express';
// Import controller functions
import { signup, login, verifyToken } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Define authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/verify', requireAuth, verifyToken);

export default router; 