const db = require('../config/db');
const { autoCancelExpiredBookings } = require('../utils/autoCancel');

// Helper to format local ISO datetime string (WIB timezone without UTC shift)
const toLocalISOString = (dateObj) => {
  const pad = (num) => (num < 10 ? '0' : '') + num;
  return dateObj.getFullYear() +
    '-' + pad(dateObj.getMonth() + 1) +
    '-' + pad(dateObj.getDate()) +
    ' ' + pad(dateObj.getHours()) +
    ':' + pad(dateObj.getMinutes()) +
    ':' + pad(dateObj.getSeconds());
};

// Helper to generate unique booking code e.g. SLN-7X9A2
const generateBookingCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'SLN-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper to enrich bookings with itemized services list and total price
const enrichBookingsWithItems = async (bookingsRows) => {
  if (!bookingsRows || bookingsRows.length === 0) return [];
  const bookingIds = bookingsRows.map(b => b.id);
  
  const itemsRes = await db.query(
    `SELECT 
       bi.id as item_id,
       bi.booking_id,
       bi.staff_name,
       bi.booking_datetime,
       s.id as service_id,
       s.name as service_name,
       s.price as service_price,
       s.duration_minutes as service_duration
     FROM booking_items bi
     JOIN services s ON bi.service_id = s.id
     WHERE bi.booking_id = ANY($1::int[])
     ORDER BY bi.id ASC`,
    [bookingIds]
  );

  const itemsByBookingId = {};
  itemsRes.rows.forEach(item => {
    if (!itemsByBookingId[item.booking_id]) {
      itemsByBookingId[item.booking_id] = [];
    }
    itemsByBookingId[item.booking_id].push(item);
  });

  return bookingsRows.map(b => {
    const items = itemsByBookingId[b.id] || [];
    let totalPrice = 0;
    
    if (items.length > 0) {
      totalPrice = items.reduce((sum, it) => sum + Number(it.service_price || 0), 0);
    } else {
      totalPrice = Number(b.service_price || 0);
      if (b.service_name) {
        items.push({
          item_id: 0,
          booking_id: b.id,
          staff_name: b.staff_name,
          booking_datetime: b.booking_datetime,
          service_id: b.service_id,
          service_name: b.service_name,
          service_price: b.service_price,
          service_duration: b.service_duration
        });
      }
    }

    // Parse payment_proof string into proofs array
    let proofs = [];
    if (b.payment_proof) {
      try {
        if (typeof b.payment_proof === 'string' && b.payment_proof.startsWith('[')) {
          proofs = JSON.parse(b.payment_proof);
        } else if (Array.isArray(b.payment_proof)) {
          proofs = b.payment_proof;
        } else {
          proofs = [b.payment_proof];
        }
      } catch {
        proofs = [b.payment_proof];
      }
    }

    return {
      ...b,
      items,
      total_price: totalPrice,
      proofs,
      payment_proof: proofs[0] || b.payment_proof,
      service_name: items.length > 1 ? `${items.length} Layanan (${items.map(i=>i.service_name).join(', ')})` : (items[0]?.service_name || b.service_name),
      service_price: totalPrice
    };
  });
};

// Create Booking (Public without Login)
const createBooking = async (req, res) => {
  try {
    const { 
      customer_name, 
      customer_phone, 
      customer_email, 
      service_id, 
      staff_name, 
      booking_datetime, 
      notes 
    } = req.body;

    if (!customer_name || !customer_phone || !customer_email || !service_id || !booking_datetime) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nama, No. HP, Email, Layanan, dan Jam Booking wajib diisi.' 
      });
    }

    // Check service exists
    const serviceRes = await db.query('SELECT * FROM services WHERE id = $1', [service_id]);
    if (serviceRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Layanan yang dipilih tidak ditemukan.' });
    }
    const service = serviceRes.rows[0];

    // 1. Fetch active staff qualified for this service
    const qualifiedStaffRes = await db.query(
      `SELECT s.id, s.name 
       FROM staff s
       JOIN staff_services ss ON s.id = ss.staff_id
       WHERE ss.service_id = $1 AND s.is_active = true`,
      [service_id]
    );

    const qualifiedStaff = qualifiedStaffRes.rows;
    if (qualifiedStaff.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Mohon maaf, saat ini belum ada staff/terapis aktif yang tersedia untuk layanan ${service.name}.`
      });
    }

    // 2. Calculate time window for requested booking
    const bookingDateObj = new Date(booking_datetime);
    const durationMins = parseInt(service.duration_minutes || 60);
    const bookingEndObj = new Date(bookingDateObj.getTime() + durationMins * 60 * 1000);

    // 3. Find active overlapping bookings in booking_items during this interval
    const overlappingRes = await db.query(
      `SELECT bi.id, bi.staff_name, bi.service_id
       FROM booking_items bi
       JOIN bookings b ON bi.booking_id = b.id
       JOIN services srv ON bi.service_id = srv.id
       WHERE b.status IN ('Pending', 'Confirmed', 'Processed')
         AND bi.booking_datetime < $1
         AND (bi.booking_datetime + (srv.duration_minutes || ' minutes')::interval) > $2`,
      [bookingEndObj, bookingDateObj]
    );

    const overlappingBookings = overlappingRes.rows;

    // Check capacity: How many qualified staff are available?
    const occupiedStaffNames = new Set(overlappingBookings.map(b => b.staff_name));
    const availableStaff = qualifiedStaff.filter(st => !occupiedStaffNames.has(st.name));

    if (availableStaff.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Mohon maaf, seluruh kuota staff untuk layanan "${service.name}" pada jam tersebut sudah penuh. Silakan pilih jam atau tanggal lain.`
      });
    }

    // Auto-assign available staff member
    const assignedStaff = availableStaff[0];
    const finalStaffName = (staff_name && staff_name !== 'Bebas / Any Staff') ? staff_name : assignedStaff.name;

    // Get deadline offset config (default 60 mins)
    const configRes = await db.query("SELECT value FROM configs WHERE key = 'payment_deadline_offset_minutes'");
    const offsetMinutes = configRes.rows.length > 0 ? parseInt(configRes.rows[0].value) : 60;

    // Calculate payment deadline:
    const nowObj = new Date();
    const offsetDeadlineObj = new Date(nowObj.getTime() + offsetMinutes * 60 * 1000);
    const deadlineObj = offsetDeadlineObj < bookingDateObj ? offsetDeadlineObj : bookingDateObj;

    const bookingDateStr = toLocalISOString(bookingDateObj);
    const deadlineStr = toLocalISOString(deadlineObj);

    // Check if an existing 'Pending' booking exists for exact same customer_name & customer_phone
    const existingPendingRes = await db.query(
      `SELECT * FROM bookings 
       WHERE customer_phone = $1 
         AND LOWER(TRIM(customer_name)) = LOWER(TRIM($2)) 
         AND status = 'Pending' 
       ORDER BY id DESC LIMIT 1`,
      [customer_phone.trim(), customer_name.trim()]
    );

    let booking;
    let isMerged = false;

    if (existingPendingRes.rows.length > 0) {
      booking = existingPendingRes.rows[0];
      isMerged = true;

      // Add new item into booking_items for existing booking
      await db.query(
        `INSERT INTO booking_items (booking_id, service_id, staff_name, booking_datetime)
         VALUES ($1, $2, $3, $4)`,
        [booking.id, service_id, finalStaffName, bookingDateStr]
      );
    } else {
      // Create new booking row
      const bookingCode = generateBookingCode();
      const insertBookingQuery = `
        INSERT INTO bookings (
          booking_code, customer_name, customer_phone, customer_email, 
          service_id, staff_name, booking_datetime, payment_deadline, 
          status, notes, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Pending', $9, 'public')
        RETURNING *;
      `;
      const insertBookingValues = [
        bookingCode,
        customer_name,
        customer_phone,
        customer_email,
        service_id,
        finalStaffName,
        bookingDateStr,
        deadlineStr,
        notes || ''
      ];
      const newBookingRes = await db.query(insertBookingQuery, insertBookingValues);
      booking = newBookingRes.rows[0];

      // Insert item into booking_items
      await db.query(
        `INSERT INTO booking_items (booking_id, service_id, staff_name, booking_datetime)
         VALUES ($1, $2, $3, $4)`,
        [booking.id, service_id, finalStaffName, bookingDateStr]
      );
    }

    // Enrich single booking output
    const enrichedList = await enrichBookingsWithItems([booking]);
    const finalBooking = enrichedList[0];

    // Get payment configs
    const configsList = await db.query("SELECT key, value FROM configs");
    const configs = {};
    configsList.rows.forEach(r => configs[r.key] = r.value);

    res.status(201).json({
      success: true,
      message: isMerged 
        ? `Layanan ${service.name} berhasil digabungkan ke kode booking #${booking.booking_code} Anda!` 
        : 'Booking berhasil dibuat!',
      is_merged: isMerged,
      booking: finalBooking,
      payment_configs: configs
    });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ success: false, message: 'Gagal membuat booking: ' + err.message });
  }
};

// Check Status Booking (Public)
const checkStatus = async (req, res) => {
  try {
    const { phone, code } = req.query;

    if (!phone && !code) {
      return res.status(400).json({ success: false, message: 'Masukkan No. HP atau Kode Booking.' });
    }

    let query = `
      SELECT b.*, s.name as service_name, s.price as service_price, s.duration_minutes as service_duration
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (code) {
      params.push(code.toUpperCase().trim());
      query += ` AND UPPER(b.booking_code) = $${params.length}`;
    }

    if (phone) {
      params.push(`%${phone.trim()}%`);
      query += ` AND b.customer_phone LIKE $${params.length}`;
    }

    query += ` ORDER BY b.id DESC`;

    const result = await db.query(query, params);
    const enrichedBookings = await enrichBookingsWithItems(result.rows);

    // Also fetch current configs for payment info display
    const configsList = await db.query("SELECT key, value FROM configs");
    const configs = {};
    configsList.rows.forEach(r => configs[r.key] = r.value);

    res.json({
      success: true,
      bookings: enrichedBookings,
      payment_configs: configs
    });
  } catch (err) {
    console.error('Error checking status:', err);
    res.status(500).json({ success: false, message: 'Gagal mengecek status booking.' });
  }
};

// Upload Payment Proof (Supports Multi-File & Appending)
const uploadPaymentProof = async (req, res) => {
  try {
    const { booking_code, booking_id } = req.body;
    let uploadedPaths = [];

    if (req.files && req.files.length > 0) {
      uploadedPaths = req.files.map(f => `/uploads/payment_proofs/${f.filename}`);
    } else if (req.file) {
      uploadedPaths = [`/uploads/payment_proofs/${req.file.filename}`];
    } else {
      return res.status(400).json({ success: false, message: 'File bukti pembayaran wajib diunggah.' });
    }

    let bookingRes;
    if (booking_code) {
      bookingRes = await db.query(
        `SELECT * FROM bookings WHERE UPPER(booking_code) = UPPER($1)`,
        [booking_code.trim()]
      );
    } else if (booking_id) {
      bookingRes = await db.query(
        `SELECT * FROM bookings WHERE id = $1`,
        [booking_id]
      );
    } else {
      return res.status(400).json({ success: false, message: 'Kode atau ID Booking tidak dispesifikasikan.' });
    }

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking tidak ditemukan.' });
    }

    const currentBooking = bookingRes.rows[0];
    let existingProofs = [];
    if (currentBooking.payment_proof) {
      try {
        if (typeof currentBooking.payment_proof === 'string' && currentBooking.payment_proof.startsWith('[')) {
          existingProofs = JSON.parse(currentBooking.payment_proof);
        } else {
          existingProofs = [currentBooking.payment_proof];
        }
      } catch {
        existingProofs = [currentBooking.payment_proof];
      }
    }

    const combinedProofs = [...existingProofs, ...uploadedPaths];
    const newProofValue = JSON.stringify(combinedProofs);

    const updateRes = await db.query(
      `UPDATE bookings SET payment_proof = $1 WHERE id = $2 RETURNING *`,
      [newProofValue, currentBooking.id]
    );

    const enriched = await enrichBookingsWithItems(updateRes.rows);

    res.json({
      success: true,
      message: 'Bukti pembayaran berhasil diunggah! Menunggu konfirmasi admin.',
      booking: enriched[0],
      payment_proofs: combinedProofs
    });
  } catch (err) {
    console.error('Error uploading payment proof:', err);
    res.status(500).json({ success: false, message: 'Gagal mengunggah bukti pembayaran.' });
  }
};

// Get All Bookings (Admin)
const getAllBookings = async (req, res) => {
  try {
    const { status, date } = req.query;
    let query = `
      SELECT b.*, s.name as service_name, s.price as service_price, s.duration_minutes as service_duration
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      params.push(status);
      query += ` AND b.status = $${params.length}`;
    }

    if (date) {
      params.push(date);
      query += ` AND DATE(b.booking_datetime) = $${params.length}`;
    }

    query += ` ORDER BY b.id DESC`;

    const result = await db.query(query, params);
    const enrichedBookings = await enrichBookingsWithItems(result.rows);

    // Get statistics
    const statsRes = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'Confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'Processed' THEN 1 END) as processed,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled
      FROM bookings;
    `);

    res.json({
      success: true,
      bookings: enrichedBookings,
      stats: statsRes.rows[0]
    });
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil data booking.' });
  }
};

// Refresh Action (Admin Button): Executes Auto-Cancel on expired pending bookings & returns updated data
const refreshBookings = async (req, res) => {
  try {
    // 1. Run auto-cancel sweep
    const cancelled = await autoCancelExpiredBookings();

    // 2. Fetch updated bookings
    const { status, date } = req.query;
    let query = `
      SELECT b.*, s.name as service_name, s.price as service_price, s.duration_minutes as service_duration
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      params.push(status);
      query += ` AND b.status = $${params.length}`;
    }

    if (date) {
      params.push(date);
      query += ` AND DATE(b.booking_datetime) = $${params.length}`;
    }

    query += ` ORDER BY b.id DESC`;

    const result = await db.query(query, params);
    const enrichedBookings = await enrichBookingsWithItems(result.rows);

    const statsRes = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status = 'Confirmed' THEN 1 END) as confirmed,
        COUNT(CASE WHEN status = 'Processed' THEN 1 END) as processed,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled
      FROM bookings;
    `);

    res.json({
      success: true,
      message: `Penyegaran data berhasil. ${cancelled.length} booking kadaluarsa otomatis dibatalkan.`,
      auto_cancelled_count: cancelled.length,
      bookings: enrichedBookings,
      stats: statsRes.rows[0]
    });
  } catch (err) {
    console.error('Error refreshing bookings:', err);
    res.status(500).json({ success: false, message: 'Gagal menyegarkan data booking.' });
  }
};

// Update Booking Status (Admin)
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processed', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status booking tidak valid.' });
    }

    let query = 'UPDATE bookings SET status = $1';
    const params = [status];

    if (notes !== undefined) {
      params.push(notes);
      query += `, notes = $${params.length}`;
    }

    params.push(id);
    query += ` WHERE id = $${params.length} RETURNING *`;

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: `Status booking #${id} berhasil diubah menjadi ${status}.`,
      booking: result.rows[0]
    });
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ success: false, message: 'Gagal mengubah status booking.' });
  }
};

// Create Manual Booking (Admin)
const createManualBooking = async (req, res) => {
  try {
    const { 
      customer_name, 
      customer_phone, 
      customer_email, 
      service_id, 
      staff_name, 
      booking_datetime, 
      status, 
      notes 
    } = req.body;

    if (!customer_name || !customer_phone || !service_id || !booking_datetime) {
      return res.status(400).json({ success: false, message: 'Nama, No. HP, Layanan, dan Waktu Booking wajib diisi.' });
    }

    const bookingCode = generateBookingCode();
    const bookingDateObj = new Date(booking_datetime);
    // 24 hour default deadline for manual booking
    const deadlineObj = new Date(bookingDateObj.getTime() + 24 * 60 * 60 * 1000);

    const initialStatus = status || 'Confirmed';

    const query = `
      INSERT INTO bookings (
        booking_code, customer_name, customer_phone, customer_email, 
        service_id, staff_name, booking_datetime, payment_deadline, 
        status, notes, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'admin')
      RETURNING *;
    `;

    const values = [
      bookingCode,
      customer_name,
      customer_phone,
      customer_email || 'manual@salon.local',
      service_id,
      staff_name || 'Admin / Resepsionis',
      bookingDateObj,
      deadlineObj,
      initialStatus,
      notes || 'Booking Manual (Dashboard)'
    ];

    const result = await db.query(query, values);

    res.status(201).json({
      success: true,
      message: 'Booking manual berhasil dibuat!',
      booking: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating manual booking:', err);
    res.status(500).json({ success: false, message: 'Gagal membuat booking manual.' });
  }
};

// Delete Booking (Admin)
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM bookings WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking tidak ditemukan.' });
    }

    res.json({
      success: true,
      message: `Booking #${id} (${result.rows[0].booking_code}) berhasil dihapus.`
    });
  } catch (err) {
    console.error('Error deleting booking:', err);
    res.status(500).json({ success: false, message: 'Gagal menghapus booking.' });
  }
};

module.exports = {
  createBooking,
  checkStatus,
  uploadPaymentProof,
  getAllBookings,
  refreshBookings,
  updateStatus,
  createManualBooking,
  deleteBooking
};
