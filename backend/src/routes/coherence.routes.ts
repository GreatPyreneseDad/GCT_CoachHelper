import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Coherence tracking routes will be implemented here
router.get('/history', authenticate, (req, res) => {
  res.json({ message: 'Coherence history endpoint' });
});

export default router;