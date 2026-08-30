const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

router.get('/', verifyAdminToken, staffController.getAllStaff);
router.post('/', verifyAdminToken, staffController.createStaff);
router.put('/:id', verifyAdminToken, staffController.updateStaff);
router.delete('/:id', verifyAdminToken, staffController.deleteStaff);

module.exports = router;
