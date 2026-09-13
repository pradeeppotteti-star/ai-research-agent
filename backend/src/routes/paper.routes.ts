import { Router } from 'express';
import {
  getPaperDetails,
  savePaper,
  removeSavedPaper,
  getSavedPapers,
} from '../controllers/paper.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/saved', authenticateToken, getSavedPapers);
router.post('/:paperId/save', authenticateToken, savePaper);
router.delete('/:paperId/save', authenticateToken, removeSavedPaper);
router.get('/:id', authenticateToken, getPaperDetails);

export default router;
