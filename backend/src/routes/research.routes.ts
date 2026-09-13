import { Router } from 'express';
import {
  startResearch,
  getResearchStatus,
  getResearchHistory,
  getResearchDetails,
  comparePapers,
  getResearchStats,
} from '../controllers/research.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/start', authenticateToken, startResearch);
router.get('/status/:id', authenticateToken, getResearchStatus);
router.get('/history', authenticateToken, getResearchHistory);
router.get('/stats', authenticateToken, getResearchStats);
router.post('/compare', authenticateToken, comparePapers);
router.get('/:id', authenticateToken, getResearchDetails);

export default router;
