import { Router } from 'express';
import { renderRegistrationForm, submitRegistration } from '../controllers/publicController.js';

const router = Router();

// Publicly available routes (no authentication middleware needed)
router.get('/register/:hostelId', renderRegistrationForm);
router.post('/register/:hostelId', submitRegistration);

export default router;
