// server/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");
const authRoutes = require("./routes/auth");
const expenseRoutes = require("./routes/expenses");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing. Add it to server/.env and restart.");
  process.exit(1);
}

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:3000" }));
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch {
    res.status(500).json({ ok: false, database: "not connected" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

// Error handler: bad JSON gets a 400, everything else a generic 500 (details go to the console)
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid request data" });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
