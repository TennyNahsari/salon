const db = require('../config/db');

// Get All Staff with mapped service IDs
const getAllStaff = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        COALESCE(
          json_agg(ss.service_id) FILTER (WHERE ss.service_id IS NOT NULL), 
          '[]'
        ) as service_ids
      FROM staff s
      LEFT JOIN staff_services ss ON s.id = ss.staff_id
      GROUP BY s.id
      ORDER BY s.id ASC;
    `;
    const result = await db.query(query);
    res.json({
      success: true,
      staff: result.rows
    });
  } catch (err) {
    console.error('Error fetching staff list:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data staff.' });
  }
};

// Create Staff
const createStaff = async (req, res) => {
  try {
    const { name, role, is_active, service_ids } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama staff wajib diisi.' });
    }

    const activeState = is_active !== undefined ? is_active : true;
    const staffRes = await db.query(
      'INSERT INTO staff (name, role, is_active) VALUES ($1, $2, $3) RETURNING *',
      [name, role || 'Stylist / Therapist', activeState]
    );
    const staff = staffRes.rows[0];

    // Insert service mappings
    if (Array.isArray(service_ids) && service_ids.length > 0) {
      for (const serviceId of service_ids) {
        await db.query(
          'INSERT INTO staff_services (staff_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [staff.id, parseInt(serviceId)]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Staff berhasil ditambahkan!',
      staff: {
        ...staff,
        service_ids: service_ids || []
      }
    });
  } catch (err) {
    console.error('Error creating staff:', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan staff.' });
  }
};

// Update Staff
const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, is_active, service_ids } = req.body;

    const staffRes = await db.query(
      'UPDATE staff SET name = $1, role = $2, is_active = $3 WHERE id = $4 RETURNING *',
      [name, role || 'Stylist / Therapist', is_active, id]
    );

    if (staffRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff tidak ditemukan.' });
    }

    // Update service mappings
    await db.query('DELETE FROM staff_services WHERE staff_id = $1', [id]);
    if (Array.isArray(service_ids) && service_ids.length > 0) {
      for (const serviceId of service_ids) {
        await db.query(
          'INSERT INTO staff_services (staff_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, parseInt(serviceId)]
        );
      }
    }

    res.json({
      success: true,
      message: 'Data staff berhasil diperbarui!',
      staff: {
        ...staffRes.rows[0],
        service_ids: service_ids || []
      }
    });
  } catch (err) {
    console.error('Error updating staff:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data staff.' });
  }
};

// Delete Staff
const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM staff WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: `Staff ${result.rows[0].name} berhasil dihapus.`
    });
  } catch (err) {
    console.error('Error deleting staff:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus staff.' });
  }
};

module.exports = {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff
};
