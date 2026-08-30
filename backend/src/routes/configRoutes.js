const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', configController.getConfigs);
router.put('/', verifyAdminToken, upload.single('qris_image'), configController.updateConfigs);

module.exports = router;
