import { Router } from 'express';
import { signup, login, logout, me, syncAccount, resetPassword } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/sync', syncAccount);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken, me);

export default router;
