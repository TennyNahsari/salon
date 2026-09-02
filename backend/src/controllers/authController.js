const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const db = require('../config/db');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin123';

    // Cek ke tabel users di PostgreSQL
    let user = null;
    try {
      const userRes = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      if (userRes.rows.length > 0) {
        user = userRes.rows[0];
      }
    } catch (e) {
      console.warn('Query users table error:', e.message);
    }

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password) || user.password === password;
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Username atau password admin salah!'
        });
      }

      const token = jwt.sign(
        { username: user.username, role: user.role || 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({
        success: true,
        message: 'Login berhasil!',
        token,
        admin: { username: user.username, role: user.role || 'admin', name: user.name }
      });
    }

    // Fallback env / hardcoded admin credentials check
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
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
