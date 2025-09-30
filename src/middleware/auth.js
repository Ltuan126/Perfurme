const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_change_this_secret';

function authRequired(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Thiếu token' });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { sub, username, role, iat, exp }
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Không đủ quyền' });
    }
    next();
  };
}

// Aliases to match newly added routes
const isAuthenticated = authRequired;
const isAdmin = (req, res, next) => requireRole('admin')(req, res, next);

module.exports = { authRequired, requireRole, isAuthenticated, isAdmin, JWT_SECRET };
