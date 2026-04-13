import pool from '../db/database.js';

export const createExpense = async (userId, title, amount, category, date, description) => {
  const [result] = await pool.query(
    'INSERT INTO expenses (user_id, title, amount, category, date, description) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, title, amount, category, date, description]
  );
  return result.insertId;
};

export const getExpenses = async (userId, filters) => {
  const { category, start, end, sort = 'date', order = 'DESC' } = filters;
  
  let query = 'SELECT * FROM expenses WHERE user_id = ?';
  const queryParams = [userId];

  if (category) {
    query += ' AND category = ?';
    queryParams.push(category);
  }
  
  if (start && end) {
    query += ' AND date >= ? AND date <= ?';
    queryParams.push(start, end);
  }

  const validSortColumns = ['date', 'amount', 'category'];
  const validOrder = ['ASC', 'DESC'];

  const sortCol = validSortColumns.includes(sort) ? sort : 'date';
  const sortOrd = validOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

  query += ` ORDER BY ${sortCol} ${sortOrd}`;

  const [rows] = await pool.query(query, queryParams);
  return rows;
};

export const getExpenseById = async (id, userId) => {
  const [rows] = await pool.query('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
  return rows[0];
};

export const updateExpense = async (id, userId, title, amount, category, date, description) => {
  const [result] = await pool.query(
    'UPDATE expenses SET title = ?, amount = ?, category = ?, date = ?, description = ? WHERE id = ? AND user_id = ?',
    [title, amount, category, date, description, id, userId]
  );
  return result.affectedRows > 0;
};

export const deleteExpense = async (id, userId) => {
  const [result] = await pool.query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
  return result.affectedRows > 0;
};
