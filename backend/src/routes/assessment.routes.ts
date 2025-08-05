import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Assessment routes will be implemented here
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Assessment endpoint' });
});

export default router;