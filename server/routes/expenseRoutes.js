import express from 'express';
import { addExpense, listExpenses, getSingleExpense, editExpense, removeExpense } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // protect all expense routes

router.route('/')
  .post(addExpense)
  .get(listExpenses);

router.route('/:id')
  .get(getSingleExpense)
  .put(editExpense)
  .delete(removeExpense);

export default router;
