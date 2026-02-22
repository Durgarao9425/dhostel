import express from 'express';
import { authMiddleware, queryTokenMiddleware } from '../middleware/auth.js';
import {
  getAllIncome,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeSummary,
  getIncomeAnalytics,
  getIncomeExport
} from '../controllers/incomeController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Income routes
router.get('/', getAllIncome);
router.post('/', createIncome);
router.put('/:incomeId', updateIncome);
router.delete('/:incomeId', deleteIncome);
router.get('/summary', getIncomeSummary);
router.get('/analytics', getIncomeAnalytics);
router.get('/export', queryTokenMiddleware, getIncomeExport);

export default router;
