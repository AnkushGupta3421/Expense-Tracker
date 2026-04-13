import pool from '../db/database.js';

export const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    // Current month start and end
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Total spent this month
    const [totalRows] = await pool.query(
      'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?',
      [userId, startOfMonth, endOfMonth]
    );

    // Category breakdown this month
    const [categoryRows] = await pool.query(
      'SELECT category, SUM(amount) as total FROM expenses WHERE user_id = ? AND date >= ? AND date <= ? GROUP BY category',
      [userId, startOfMonth, endOfMonth]
    );

    // Highest single expense this month
    const [highestRows] = await pool.query(
      'SELECT * FROM expenses WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY amount DESC LIMIT 1',
      [userId, startOfMonth, endOfMonth]
    );

    res.json({
      success: true,
      data: {
        totalSpent: totalRows[0].total || 0,
        categoryBreakdown: categoryRows,
        highestExpense: highestRows[0] || null
      },
      message: 'Summary fetched'
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const getTrend = async (req, res) => {
  try {
    const userId = req.user.id;
    const timeframe = req.query.timeframe || 'monthly';
    
    let query = '';
    
    if (timeframe === 'daily') {
      query = `
        SELECT DATE_FORMAT(date, '%Y-%m-%d') as period, SUM(amount) as total
        FROM expenses
        WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY period
        ORDER BY period ASC
      `;
    } else if (timeframe === 'weekly') {
      query = `
        SELECT DATE_FORMAT(DATE_ADD(date, INTERVAL(1-DAYOFWEEK(date)) DAY), '%Y-%m-%d') as period, SUM(amount) as total
        FROM expenses
        WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
        GROUP BY period
        ORDER BY period ASC
      `;
    } else {
      query = `
        SELECT DATE_FORMAT(date, '%Y-%m') as period, SUM(amount) as total
        FROM expenses
        WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY period
        ORDER BY period ASC
      `;
    }
    
    const [rows] = await pool.query(query, [userId]);

    res.json({
      success: true,
      data: rows,
      message: 'Trend fetched'
    });
  } catch (error) {
    console.error('Trend error:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const getInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Compare current month vs last month
    const now = new Date();
    
    // This month
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endOfThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    // Last month
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

    // Fetch this month total
    const [thisMonthRows] = await pool.query(
      'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?',
      [userId, startOfThisMonth, endOfThisMonth]
    );
    const thisMonthTotal = thisMonthRows[0].total || 0;

    // Fetch last month total
    const [lastMonthRows] = await pool.query(
      'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?',
      [userId, startOfLastMonth, endOfLastMonth]
    );
    const lastMonthTotal = lastMonthRows[0].total || 0;

    let insightMessage = '';
    if (lastMonthTotal === 0 && thisMonthTotal > 0) {
      insightMessage = "You spent your first amounts this month!";
    } else if (lastMonthTotal === 0 && thisMonthTotal === 0) {
      insightMessage = "No spending recorded this or last month.";
    } else {
      const diff = thisMonthTotal - lastMonthTotal;
      const percentDiff = Math.round(Math.abs(diff) / lastMonthTotal * 100);
      if (diff > 0) {
        insightMessage = `You spent ${percentDiff}% more this month vs last month.`;
      } else if (diff < 0) {
        insightMessage = `You spent ${percentDiff}% less this month vs last month.`;
      } else {
        insightMessage = `You spent the exact same amount this month as last month.`;
      }
    }

    res.json({
      success: true,
      data: {
        thisMonth: thisMonthTotal,
        lastMonth: lastMonthTotal,
        insight: insightMessage
      },
      message: 'Insights fetched'
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};

export const generateReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const timeframe = req.query.timeframe || 'this_month';
    
    let query = 'SELECT title, amount, category, date, description FROM expenses WHERE user_id = ?';
    let params = [userId];

    if (timeframe === 'today') {
      query += ' AND date = CURDATE()';
    } else if (timeframe === 'this_week') {
      query += ' AND YEARWEEK(date, 1) = YEARWEEK(CURDATE(), 1)';
    } else if (timeframe === 'this_month') {
      query += ' AND YEAR(date) = YEAR(CURDATE()) AND MONTH(date) = MONTH(CURDATE())';
    } else if (timeframe === 'this_year') {
      query += ' AND YEAR(date) = YEAR(CURDATE())';
    }
    
    query += ' ORDER BY date DESC';

    const [rows] = await pool.query(query, params);

    res.json({
      success: true,
      data: rows,
      message: 'Report data fetched'
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ success: false, message: 'Server error', data: null });
  }
};
