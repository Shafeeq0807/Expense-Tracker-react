// server/routes/expenses.js
const express = require("express");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Keep this list in sync with src/utils.js
const CATEGORIES = [
  "Food",
  "Transport",
  "Books & Stationery",
  "Rent & Hostel",
  "Recharge & Internet",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
  "Fees",
  "Others",
];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_AMOUNT = 1e8; // matches DECIMAL(10,2)

const pad = (n) => String(n).padStart(2, "0");
const localDateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

// Returns an error message, or null when the body is valid
function validateExpense(body) {
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0 || amount >= MAX_AMOUNT) {
    return "Amount must be a positive number";
  }
  if (!CATEGORIES.includes(body.category)) {
    return "Please choose a valid category";
  }
  if (!DATE_RE.test(body.date || "")) {
    return "Please choose a valid date";
  }
  if (String(body.note || "").length > 255) {
    return "Note must be 255 characters or fewer";
  }
  return null;
}

const toExpense = (row) => ({ ...row, amount: Number(row.amount) });

// GET /api/expenses?from=YYYY-MM-DD&to=YYYY-MM-DD&category=Food
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const where = ["user_id = ?"];
    const params = [req.user.id];

    if (DATE_RE.test(req.query.from || "")) {
      where.push("expense_date >= ?");
      params.push(req.query.from);
    }
    if (DATE_RE.test(req.query.to || "")) {
      where.push("expense_date <= ?");
      params.push(req.query.to);
    }
    if (CATEGORIES.includes(req.query.category)) {
      where.push("category = ?");
      params.push(req.query.category);
    }

    const [rows] = await pool.query(
      `SELECT id, amount, category, note, expense_date AS date
         FROM expenses
        WHERE ${where.join(" AND ")}
        ORDER BY expense_date DESC, id DESC`,
      params
    );
    res.json(rows.map(toExpense));
  } catch (err) {
    next(err);
  }
});

// POST /api/expenses  { amount, category, note, date }
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const error = validateExpense(req.body);
    if (error) return res.status(400).json({ error });

    const note = String(req.body.note || "").trim();
    const [result] = await pool.query(
      "INSERT INTO expenses (user_id, amount, category, note, expense_date) VALUES (?, ?, ?, ?, ?)",
      [req.user.id, Number(req.body.amount), req.body.category, note, req.body.date]
    );

    const [rows] = await pool.query(
      "SELECT id, amount, category, note, expense_date AS date FROM expenses WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(toExpense(rows[0]));
  } catch (err) {
    next(err);
  }
});

// PUT /api/expenses/:id  { amount, category, note, date }
router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const error = validateExpense(req.body);
    if (error) return res.status(400).json({ error });

    const note = String(req.body.note || "").trim();
    const [result] = await pool.query(
      `UPDATE expenses
          SET amount = ?, category = ?, note = ?, expense_date = ?
        WHERE id = ? AND user_id = ?`,
      [Number(req.body.amount), req.body.category, note, req.body.date, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }

    const [rows] = await pool.query(
      "SELECT id, amount, category, note, expense_date AS date FROM expenses WHERE id = ?",
      [req.params.id]
    );
    res.json(toExpense(rows[0]));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/expenses/:id
router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM expenses WHERE id = ? AND user_id = ?", [
      req.params.id,
      req.user.id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /api/expenses/analytics?months=6
// Returns monthly totals (zero-filled), category breakdown, the last 30 days, and summary figures.
router.get("/analytics", requireAuth, async (req, res, next) => {
  try {
    const months = Math.min(Math.max(parseInt(req.query.months, 10) || 6, 2), 24);
    const now = new Date();
    const uid = req.user.id;

    // Start of the earliest month in the window (current month + previous months - 1)
    const windowStart = `DATE_FORMAT(CURDATE() - INTERVAL ? MONTH, '%Y-%m-01')`;

    const [monthlyRows] = await pool.query(
      `SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month,
              SUM(amount) AS total, COUNT(*) AS count
         FROM expenses
        WHERE user_id = ? AND expense_date >= ${windowStart}
        GROUP BY month ORDER BY month`,
      [uid, months - 1]
    );

    const [categoryRows] = await pool.query(
      `SELECT category, SUM(amount) AS total, COUNT(*) AS count
         FROM expenses
        WHERE user_id = ? AND expense_date >= ${windowStart}
        GROUP BY category ORDER BY total DESC`,
      [uid, months - 1]
    );

    const [dailyRows] = await pool.query(
      `SELECT expense_date AS date, SUM(amount) AS total
         FROM expenses
        WHERE user_id = ? AND expense_date >= CURDATE() - INTERVAL 29 DAY
        GROUP BY expense_date ORDER BY expense_date`,
      [uid]
    );

    // Zero-fill months so charts never have gaps
    const monthlyMap = Object.fromEntries(monthlyRows.map((r) => [r.month, r]));
    const monthly = [];
    for (let i = months - 1; i >= 0; i--) {
      const key = monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1));
      const row = monthlyMap[key];
      monthly.push({ month: key, total: row ? Number(row.total) : 0, count: row ? Number(row.count) : 0 });
    }

    // Zero-fill the last 30 days
    const dailyMap = Object.fromEntries(dailyRows.map((r) => [r.date, Number(r.total)]));
    const daily = [];
    for (let i = 29; i >= 0; i--) {
      const key = localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i));
      daily.push({ date: key, total: dailyMap[key] || 0 });
    }

    const categories = categoryRows.map((r) => ({
      category: r.category,
      total: Number(r.total),
      count: Number(r.count),
    }));
    const windowTotal = categories.reduce((sum, c) => sum + c.total, 0);
    const windowCount = categories.reduce((sum, c) => sum + c.count, 0);

    const thisMonth = monthly[monthly.length - 1].total;
    const lastMonth = monthly[monthly.length - 2].total;
    const daysElapsed = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyAverageThisMonth = thisMonth / daysElapsed;

    const [userRows] = await pool.query("SELECT monthly_budget FROM users WHERE id = ?", [uid]);
    const budget = userRows[0] && userRows[0].monthly_budget !== null ? Number(userRows[0].monthly_budget) : null;

    res.json({
      months: monthly,
      categories,
      daily,
      budget,
      summary: {
        windowMonths: months,
        windowTotal,
        windowCount,
        averageMonthly: windowTotal / months,
        thisMonth,
        lastMonth,
        changePct: lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null,
        projectedThisMonth: dailyAverageThisMonth * daysInMonth,
        topCategory: categories[0] || null,
        transactionsThisMonth: monthly[monthly.length - 1].count,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
