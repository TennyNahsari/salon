const db = require('../config/db');

// Get all payment and general configs
const getConfigs = async (req, res) => {
  try {
    const result = await db.query('SELECT key, value, description FROM configs ORDER BY id ASC');
    const configsObj = {};
    result.rows.forEach(row => {
      configsObj[row.key] = row.value;
    });
    res.json({
      success: true,
      configs: configsObj,
      raw: result.rows
    });
  } catch (err) {
    console.error('Error fetching configs:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil konfigurasi.' });
  }
};

// Update configs
const updateConfigs = async (req, res) => {
  try {
    const { 
      payment_bank_name, 
      payment_account_number, 
      whatsapp_number, 
      payment_deadline_offset_minutes,
      social_instagram,
      social_twitter,
      social_youtube,
      social_facebook,
      social_linkedin,
      social_threads
    } = req.body;

    const updates = [
      { key: 'payment_bank_name', value: payment_bank_name },
      { key: 'payment_account_number', value: payment_account_number },
      { key: 'whatsapp_number', value: whatsapp_number },
      { key: 'payment_deadline_offset_minutes', value: payment_deadline_offset_minutes },
      { key: 'social_instagram', value: social_instagram },
      { key: 'social_twitter', value: social_twitter },
      { key: 'social_youtube', value: social_youtube },
      { key: 'social_facebook', value: social_facebook },
      { key: 'social_linkedin', value: social_linkedin },
      { key: 'social_threads', value: social_threads }
    ];

    if (req.file) {
      const qrisPath = `/uploads/qris/${req.file.filename}`;
      updates.push({ key: 'payment_qris_image', value: qrisPath });
    }

    for (const item of updates) {
      if (item.value !== undefined) {
        await db.query(
          `INSERT INTO configs (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [item.key, String(item.value)]
        );
      }
    }

    res.json({ success: true, message: 'Konfigurasi berhasil diperbarui!' });
  } catch (err) {
    console.error('Error updating configs:', err);
    res.status(500).json({ success: false, message: 'Gagal memperbarui konfigurasi.' });
  }
};

module.exports = {
  getConfigs,
  updateConfigs
};
