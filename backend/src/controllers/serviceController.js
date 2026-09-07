const db = require('../config/db');

const getAllServices = async (req, res) => {
  try {
    const { outlet_id } = req.query;
    let whereClause = '';
    let params = [];

    if (outlet_id) {
      whereClause = 'WHERE s.id IN (SELECT service_id FROM outlet_services WHERE outlet_id = $1)';
      params = [outlet_id];
    }

    const query = `
      SELECT 
        s.*,
        COALESCE(
          json_agg(os.outlet_id) FILTER (WHERE os.outlet_id IS NOT NULL), 
          '[]'
        ) as outlet_ids
      FROM services s
      LEFT JOIN outlet_services os ON s.id = os.service_id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.id ASC;
    `;

    const result = await db.query(query, params);
    res.json({ success: true, services: result.rows });
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data layanan.' });
  }
};

const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        s.*,
        COALESCE(
          json_agg(os.outlet_id) FILTER (WHERE os.outlet_id IS NOT NULL), 
          '[]'
        ) as outlet_ids
      FROM services s
      LEFT JOIN outlet_services os ON s.id = os.service_id
      WHERE s.id = $1
      GROUP BY s.id;
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    }
    res.json({ success: true, service: result.rows[0] });
  } catch (err) {
    console.error('Error fetching service detail:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail layanan.' });
  }
};

const createService = async (req, res) => {
  try {
    const { name, duration_minutes, price, description, image_url, outlet_ids } = req.body;
    if (!name || !duration_minutes || !price) {
      return res.status(400).json({ success: false, message: 'Nama, durasi, dan harga wajib diisi.' });
    }

    const defaultImg = image_url || 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=600&q=80';
    const result = await db.query(
      `INSERT INTO services (name, duration_minutes, price, description, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, parseInt(duration_minutes), parseFloat(price), description || '', defaultImg]
    );

    const service = result.rows[0];

    // Insert outlet mappings
    if (Array.isArray(outlet_ids) && outlet_ids.length > 0) {
      for (const outletId of outlet_ids) {
        await db.query(
          'INSERT INTO outlet_services (outlet_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [parseInt(outletId), service.id]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'Layanan baru berhasil ditambahkan.',
      service: {
        ...service,
        outlet_ids: outlet_ids || []
      }
    });
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ success: false, message: 'Gagal menambahkan layanan.' });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration_minutes, price, description, image_url, outlet_ids } = req.body;

    const result = await db.query(
      `UPDATE services 
       SET name = $1, duration_minutes = $2, price = $3, description = $4, image_url = $5
       WHERE id = $6 RETURNING *`,
      [name, parseInt(duration_minutes), parseFloat(price), description, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    }

    // Update outlet mappings
    if (Array.isArray(outlet_ids)) {
      await db.query('DELETE FROM outlet_services WHERE service_id = $1', [id]);
      for (const outletId of outlet_ids) {
        await db.query(
          'INSERT INTO outlet_services (outlet_id, service_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [parseInt(outletId), id]
        );
      }
    }

    res.json({
      success: true,
      message: 'Layanan berhasil diperbarui.',
      service: {
        ...result.rows[0],
        outlet_ids: outlet_ids || []
      }
    });
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui layanan.' });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layanan tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Layanan berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus layanan.' });
  }
};

module.exports = {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
};
