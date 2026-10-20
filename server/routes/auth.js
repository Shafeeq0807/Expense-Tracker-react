// server/routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const signToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const toPublicUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  monthly_budget: row.monthly_budget === null ? null : Number(row.monthly_budget),
});

// POST /api/auth/register  { name, email, password }
router.post("/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || name.length > 100) {
      return res.status(400).json({ error: "Please enter your name" });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash]
    );

    const user = { id: result.insertId, name, email, monthly_budget: null };
    res.status(201).json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login  { email, password }
router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const row = rows[0];
    const passwordOk = row ? await bcrypt.compare(password, row.password_hash) : false;

    if (!passwordOk) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = toPublicUser(row);
    res.json({ token: signToken(user), user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me  (checks a saved token and returns the current user)
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, monthly_budget FROM users WHERE id = ?",
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Please log in first" });
    }
    res.json({ user: toPublicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/budget  { monthly_budget }  (null clears the budget)
router.put("/budget", requireAuth, async (req, res, next) => {
  try {
    const raw = req.body.monthly_budget;
    const budget = raw === null || raw === "" ? null : Number(raw);

    if (budget !== null && (!Number.isFinite(budget) || budget < 0 || budget >= 1e8)) {
      return res.status(400).json({ error: "Budget must be a positive amount" });
    }

    await pool.query("UPDATE users SET monthly_budget = ? WHERE id = ?", [budget, req.user.id]);
    res.json({ monthly_budget: budget });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
