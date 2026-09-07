const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Get all users (Super Admin only)
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.username, u.name, u.role, u.outlet_id, u.created_at, o.name as outlet_name
      FROM users u
      LEFT JOIN outlets o ON u.outlet_id = o.id
      ORDER BY u.id ASC
    `);
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data user.' });
  }
};

// Create new user (Super Admin only)
const createUser = async (req, res) => {
  try {
    const { username, password, name, role, outlet_id } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({ success: false, message: 'Username, password, dan nama wajib diisi!' });
    }

    const finalRole = role === 'admin' ? 'admin' : 'outlet_admin';
    if (finalRole === 'outlet_admin' && !outlet_id) {
      return res.status(400).json({ success: false, message: 'Untuk peran Outlet Admin, wajib memilih cabang outlet!' });
    }

    // Check unique username
    const existing = await db.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1)', [username.trim()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan, silakan gunakan username lain.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalOutletId = finalRole === 'admin' ? null : (outlet_id ? parseInt(outlet_id) : null);

    const result = await db.query(
      `INSERT INTO users (username, password, name, role, outlet_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, name, role, outlet_id, created_at`,
      [username.trim(), hashedPassword, name.trim(), finalRole, finalOutletId]
    );

    res.status(201).json({
      success: true,
      message: 'User baru berhasil ditambahkan!',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ success: false, message: err.message || 'Gagal menambahkan user baru.' });
  }
};

// Update user (Super Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, name, role, outlet_id } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama wajib diisi!' });
    }

    const finalRole = role === 'admin' ? 'admin' : 'outlet_admin';
    if (finalRole === 'outlet_admin' && !outlet_id) {
      return res.status(400).json({ success: false, message: 'Untuk peran Outlet Admin, wajib memilih cabang outlet!' });
    }

    // Check username if provided and changed
    if (username) {
      const checkU = await db.query('SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2', [username.trim(), id]);
      if (checkU.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Username sudah digunakan oleh user lain.' });
      }
    }

    const finalOutletId = finalRole === 'admin' ? null : (outlet_id ? parseInt(outlet_id) : null);

    let query, params;
    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `
        UPDATE users 
        SET username = COALESCE($1, username),
            password = $2,
            name = $3,
            role = $4,
            outlet_id = $5
        WHERE id = $6
        RETURNING id, username, name, role, outlet_id, created_at
      `;
      params = [username ? username.trim() : null, hashedPassword, name.trim(), finalRole, finalOutletId, id];
    } else {
      query = `
        UPDATE users 
        SET username = COALESCE($1, username),
            name = $2,
            role = $3,
            outlet_id = $4
        WHERE id = $5
        RETURNING id, username, name, role, outlet_id, created_at
      `;
      params = [username ? username.trim() : null, name.trim(), finalRole, finalOutletId, id];
    }

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: 'Data user berhasil diperbarui!',
      user: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, message: err.message || 'Gagal memperbarui data user.' });
  }
};

// Delete user (Super Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent user from deleting self
    if (req.admin && req.admin.id && parseInt(id) === parseInt(req.admin.id)) {
      return res.status(400).json({ success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.' });
    }

    const check = await db.query('SELECT id, username FROM users WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
    }

    if (check.rows[0].username === 'admin') {
      return res.status(400).json({ success: false, message: 'Akun Super Admin utama tidak boleh dihapus.' });
    }

    await db.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ success: true, message: 'User berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus user.' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
