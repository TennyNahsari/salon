const db = require('../config/db');

// Get All Outlets (with mapped service_ids)
const getAllOutlets = async (req, res) => {
  try {
    const { active_only } = req.query;
    let whereClause = '';
    if (active_only === 'true') {
      whereClause = 'WHERE o.is_active = true';
    }

    const query = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(os.service_id) FILTER (WHERE os.service_id IS NOT NULL), 
          '[]'
        ) as service_ids
      FROM outlets o
      LEFT JOIN outlet_services os ON o.id = os.outlet_id
      ${whereClause}
      GROUP BY o.id
      ORDER BY o.id ASC;
    `;
    const result = await db.query(query);
    res.json({
      success: true,
      outlets: result.rows
    });
  } catch (err) {
    console.error('Error fetching outlets list:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data outlet.' });
  }
};

// Get Outlet By ID
const getOutletById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        o.*,
        COALESCE(
          json_agg(os.service_id) FILTER (WHERE os.service_id IS NOT NULL), 
          '[]'
        ) as service_ids
      FROM outlets o
      LEFT JOIN outlet_services os ON o.id = os.outlet_id
      WHERE o.id = $1
      GROUP BY o.id;
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Outlet tidak ditemukan.' });
    }

    res.json({ success: true, outlet: result.rows[0] });
  } catch (err) {
    console.error('Error fetching outlet detail:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail outlet.' });
  }
};

// Create Outlet
const createOutlet = async (req, res) => {
  try {
    const { name, address, phone, image_url, is_active, service_ids } = req.body;
    if (!name || !address) {
      return res.status(400).json({ success: false, message: 'Nama outlet dan alamat wajib diisi.' });
    }

    const activeState = is_active !== undefined ? is_active : true;
    const defaultImg = image_url || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80';

    const outletRes = await db.query(
      'INSERT INTO outlets (name, address, phone, image_url, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, address, phone || '', defaultImg, activeState]
    );
    const outlet = outletRes.rows[0];

    // Insert service mappings for outlet
    if (Array.isArray(service_ids) && service_ids.length > 0) {
      for (const serviceId of service_ids) {
        await db.query(
          'INSERT INTO outlet_services (outlet_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [outlet.id, parseInt(serviceId)]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Outlet cabang baru berhasil ditambahkan!',
      outlet: {
        ...outlet,
        service_ids: service_ids || []
      }
    });
  } catch (err) {
    console.error('Error creating outlet:', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan outlet.' });
  }
};

// Update Outlet
const updateOutlet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, image_url, is_active, service_ids } = req.body;

    const outletRes = await db.query(
      'UPDATE outlets SET name = $1, address = $2, phone = $3, image_url = $4, is_active = $5 WHERE id = $6 RETURNING *',
      [name, address, phone || '', image_url, is_active, id]
    );

    if (outletRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Outlet tidak ditemukan.' });
    }

    // Update service mappings
    if (Array.isArray(service_ids)) {
      await db.query('DELETE FROM outlet_services WHERE outlet_id = $1', [id]);
      for (const serviceId of service_ids) {
        await db.query(
          'INSERT INTO outlet_services (outlet_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, parseInt(serviceId)]
        );
      }
    }

    res.json({
      success: true,
      message: 'Data outlet berhasil diperbarui!',
      outlet: {
        ...outletRes.rows[0],
        service_ids: service_ids || []
      }
    });
  } catch (err) {
    console.error('Error updating outlet:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data outlet.' });
  }
};

// Delete Outlet
const deleteOutlet = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM outlets WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Outlet tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: `Outlet ${result.rows[0].name} berhasil dihapus.`
    });
  } catch (err) {
    console.error('Error deleting outlet:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus outlet.' });
  }
};

module.exports = {
  getAllOutlets,
  getOutletById,
  createOutlet,
  updateOutlet,
  deleteOutlet
};
