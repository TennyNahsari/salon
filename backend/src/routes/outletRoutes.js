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

// Public route to get all outlets
router.get('/', getAllOutlets);
router.get('/:id', getOutletById);

// Super Admin only routes for managing outlets
router.post('/', verifyAdminToken, requireSuperAdmin, createOutlet);
router.put('/:id', verifyAdminToken, requireSuperAdmin, updateOutlet);
router.delete('/:id', verifyAdminToken, requireSuperAdmin, deleteOutlet);

module.exports = router;

