import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Appointment routes will be implemented here
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Appointments endpoint' });
});

export default router;