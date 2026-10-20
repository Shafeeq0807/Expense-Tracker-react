// server/db.js
require("dotenv").config();
const mysql = require("mysql2/promise");

// dateStrings makes DATE columns come back as "YYYY-MM-DD" instead of Date objects
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "expense_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,
});

module.exports = pool;
