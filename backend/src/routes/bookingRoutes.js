const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.post('/', bookingController.createBooking);
router.get('/check', bookingController.checkStatus);
router.post('/upload-proof', upload.array('payment_proof', 5), bookingController.uploadPaymentProof);

// Admin routes
router.get('/', verifyAdminToken, bookingController.getAllBookings);
router.post('/refresh', verifyAdminToken, bookingController.refreshBookings);
router.post('/manual', verifyAdminToken, bookingController.createManualBooking);
router.patch('/:id/status', verifyAdminToken, bookingController.updateStatus);
router.delete('/:id', verifyAdminToken, bookingController.deleteBooking);

module.exports = router;
