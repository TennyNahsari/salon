const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const login = (req, res) => {
  const { username, password } = req.body;

  // Simple admin credentials check (default: admin / admin123 or configurable env)
  const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign(
      { username: ADMIN_USER, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      admin: { username: ADMIN_USER, role: 'admin' }
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Username atau password admin salah!'
    });
  }
};

const getMe = (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
};

module.exports = {
  login,
  getMe
};
