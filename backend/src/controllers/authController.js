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
      const userRes = await db.query(
        `SELECT u.*, o.name as outlet_name
         FROM users u
         LEFT JOIN outlets o ON u.outlet_id = o.id
         WHERE u.username = $1`,
        [username]
      );
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
        { 
          id: user.id, 
          username: user.username, 
          role: user.role || 'admin', 
          outlet_id: user.outlet_id || null 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({
        success: true,
        message: 'Login berhasil!',
        token,
        admin: { 
          id: user.id,
          username: user.username, 
          role: user.role || 'admin', 
          name: user.name,
          outlet_id: user.outlet_id || null,
          outlet_name: user.outlet_name || null
        }
      });
    }

    // Fallback env / hardcoded admin credentials check
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = jwt.sign(
        { username: ADMIN_USER, role: 'admin', outlet_id: null },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.json({
        success: true,
        message: 'Login berhasil!',
        token,
        admin: { username: ADMIN_USER, role: 'admin', name: 'Super Admin', outlet_id: null, outlet_name: null }
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

const getMe = async (req, res) => {
  try {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const userRes = await db.query(
      `SELECT u.id, u.username, u.name, u.role, u.outlet_id, o.name as outlet_name
       FROM users u
       LEFT JOIN outlets o ON u.outlet_id = o.id
       WHERE u.username = $1`,
      [req.admin.username]
    );
    if (userRes.rows.length > 0) {
      return res.json({
        success: true,
        admin: userRes.rows[0]
      });
    }
    res.json({
      success: true,
      admin: req.admin
    });
  } catch (err) {
    res.json({
      success: true,
      admin: req.admin
    });
  }
};

module.exports = {
  login,
  getMe
};
