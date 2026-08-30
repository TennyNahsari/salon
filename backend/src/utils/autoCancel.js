const db = require('../config/db');

/**
 * Sweeps all pending bookings that passed their payment_deadline
 * and updates their status to 'Cancelled'.
 */
const autoCancelExpiredBookings = async () => {
  try {
    const query = `
      UPDATE bookings 
      SET status = 'Cancelled', notes = COALESCE(notes, '') || ' [Dibatalkan otomatis: Melewati batas bayar]'
      WHERE status = 'Pending' 
        AND payment_deadline < NOW()
      RETURNING id, booking_code, customer_name, payment_deadline;
    `;
    const result = await db.query(query);
    if (result.rows.length > 0) {
      console.log(`Auto-cancelled ${result.rows.length} expired pending bookings:`, result.rows.map(r => r.booking_code));
    }
    return result.rows;
  } catch (err) {
    console.error('Error auto-cancelling expired bookings:', err.message);
    return [];
  }
};

module.exports = {
  autoCancelExpiredBookings
};
