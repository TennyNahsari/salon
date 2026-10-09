const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', verifyAdminToken, upload.single('service_image'), serviceController.createService);
router.put('/:id', verifyAdminToken, upload.single('service_image'), serviceController.updateService);
router.delete('/:id', verifyAdminToken, serviceController.deleteService);

module.exports = router;
