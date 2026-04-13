import { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense } from '../models/expenseModel.js';

export const addExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;
    const userId = req.user.id;

    if (!title || !amount || !category || !date) {
      return res.status(400).json({ success: false, message: 'Missing required fields', data: null });
    }

    const expenseId = await createExpense(userId, title, amount, category, date, description);
    
    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: { id: expenseId, title, amount, category, date, description }
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const listExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    // parse query filters
    const filters = {
      category: req.query.category,
      start: req.query.start,
      end: req.query.end,
      sort: req.query.sort,
      order: req.query.order || 'DESC'
    };

    const expenses = await getExpenses(userId, filters);

    // Apply basic pagination via JS for simplicity if needed, or return all and let frontend handle it.
    // The prompt asks for paginated table, we will implement client-side pagination for smoother UX or basic array slicing.
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginated = expenses.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        expenses: paginated,
        total: expenses.length,
        page,
        pages: Math.ceil(expenses.length / limit)
      },
      message: 'Expenses fetched'
    });
  } catch (error) {
    console.error('List expenses error:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const getSingleExpense = async (req, res) => {
  try {
    const expense = await getExpenseById(req.params.id, req.user.id);
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found', data: null });
    }
    res.json({ success: true, data: expense, message: 'Expense found' });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const editExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;
    
    const success = await updateExpense(req.params.id, req.user.id, title, amount, category, date, description);
    
    if (!success) {
      return res.status(404).json({ success: false, message: 'Expense not found or no changes made', data: null });
    }

    res.json({ success: true, message: 'Expense updated successfully', data: null });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const removeExpense = async (req, res) => {
  try {
    const success = await deleteExpense(req.params.id, req.user.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Expense not found', data: null });
    }
    res.json({ success: true, message: 'Expense deleted successfully', data: null });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
