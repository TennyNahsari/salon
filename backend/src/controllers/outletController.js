const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Helper to remove physical file from disk if it was stored in uploads/outlets
const removePhysicalFile = (imageUrl) => {
  if (imageUrl && imageUrl.startsWith('/uploads/outlets/')) {
    const filename = path.basename(imageUrl);
    const filePath = path.join(__dirname, '../../uploads/outlets', filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error removing old outlet photo file:', filePath, err);
      }
    }
  }
};

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
    let { name, address, phone, image_url, is_active, service_ids } = req.body;
    if (!name || !address) {
      return res.status(400).json({ success: false, message: 'Nama outlet dan alamat wajib diisi.' });
    }

    const activeState = is_active !== undefined ? (is_active === true || is_active === 'true') : true;
    
    let finalImageUrl = image_url || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=600&q=80';
    if (req.file) {
      finalImageUrl = `/uploads/outlets/${req.file.filename}`;
    }

    let parsedServiceIds = [];
    if (typeof service_ids === 'string') {
      try {
        parsedServiceIds = JSON.parse(service_ids);
      } catch (e) {
        parsedServiceIds = service_ids.split(',').map(id => id.trim()).filter(Boolean);
      }
    } else if (Array.isArray(service_ids)) {
      parsedServiceIds = service_ids;
    }

    const outletRes = await db.query(
      'INSERT INTO outlets (name, address, phone, image_url, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, address, phone || '', finalImageUrl, activeState]
    );
    const outlet = outletRes.rows[0];

    // Insert service mappings for outlet
    if (Array.isArray(parsedServiceIds) && parsedServiceIds.length > 0) {
      for (const serviceId of parsedServiceIds) {
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
        service_ids: parsedServiceIds
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
    let { name, address, phone, image_url, is_active, service_ids, remove_photo } = req.body;

    const activeState = is_active !== undefined ? (is_active === true || is_active === 'true') : true;

    // Fetch existing outlet record to compare image_url
    const currentRes = await db.query('SELECT * FROM outlets WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Outlet tidak ditemukan.' });
    }
    const currentOutlet = currentRes.rows[0];

    let finalImageUrl = image_url;
    if (req.file) {
      finalImageUrl = `/uploads/outlets/${req.file.filename}`;
      // Clean up previous uploaded file if replacing
      if (currentOutlet.image_url && currentOutlet.image_url !== finalImageUrl) {
        removePhysicalFile(currentOutlet.image_url);
      }
    } else if (remove_photo === 'true' || remove_photo === true) {
      finalImageUrl = '';
      if (currentOutlet.image_url) {
        removePhysicalFile(currentOutlet.image_url);
      }
    } else if (image_url === '' && currentOutlet.image_url) {
      removePhysicalFile(currentOutlet.image_url);
    }

    let parsedServiceIds = service_ids;
    if (typeof service_ids === 'string') {
      try {
        parsedServiceIds = JSON.parse(service_ids);
      } catch (e) {
        parsedServiceIds = service_ids.split(',').map(sId => sId.trim()).filter(Boolean);
      }
    }

    const outletRes = await db.query(
      'UPDATE outlets SET name = $1, address = $2, phone = $3, image_url = $4, is_active = $5 WHERE id = $6 RETURNING *',
      [name, address, phone || '', finalImageUrl, activeState, id]
    );

    // Update service mappings
    if (Array.isArray(parsedServiceIds)) {
      await db.query('DELETE FROM outlet_services WHERE outlet_id = $1', [id]);
      for (const serviceId of parsedServiceIds) {
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
        service_ids: Array.isArray(parsedServiceIds) ? parsedServiceIds : []
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

    // Clean up physical photo file if it was uploaded
    if (result.rows[0].image_url) {
      removePhysicalFile(result.rows[0].image_url);
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
