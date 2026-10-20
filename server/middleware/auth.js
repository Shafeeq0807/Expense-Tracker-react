// server/middleware/auth.js
const jwt = require("jsonwebtoken");

// Expects "Authorization: Bearer <token>" and attaches the decoded user to req.user
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Please log in first" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Your session has expired, please log in again" });
  }
}

module.exports = { requireAuth };
