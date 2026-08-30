const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', verifyAdminToken, serviceController.createService);
router.put('/:id', verifyAdminToken, serviceController.updateService);
router.delete('/:id', verifyAdminToken, serviceController.deleteService);

module.exports = router;
