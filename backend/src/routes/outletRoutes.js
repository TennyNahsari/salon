const express = require('express');
const router = express.Router();
const { 
  getAllOutlets, 
  getOutletById, 
  createOutlet, 
  updateOutlet, 
  deleteOutlet 
} = require('../controllers/outletController');
const { verifyAdminToken, requireSuperAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route to get all outlets
router.get('/', getAllOutlets);
router.get('/:id', getOutletById);

// Super Admin only routes for managing outlets
router.post('/', verifyAdminToken, requireSuperAdmin, upload.single('outlet_image'), createOutlet);
router.put('/:id', verifyAdminToken, requireSuperAdmin, upload.single('outlet_image'), updateOutlet);
router.delete('/:id', verifyAdminToken, requireSuperAdmin, deleteOutlet);

module.exports = router;

