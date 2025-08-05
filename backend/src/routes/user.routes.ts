import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// User routes will be implemented here
router.get('/profile', authenticate, (req, res) => {
  res.json({ message: 'User profile endpoint' });
});

export default router;