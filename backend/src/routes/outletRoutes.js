const express = require('express');
const router = express.Router();
const { 
  getAllOutlets, 
  getOutletById, 
  createOutlet, 
  updateOutlet, 
  deleteOutlet 
} = require('../controllers/outletController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

// Public route to get all outlets
router.get('/', getAllOutlets);
router.get('/:id', getOutletById);

// Admin protected routes
router.post('/', verifyAdminToken, createOutlet);
router.put('/:id', verifyAdminToken, updateOutlet);
router.delete('/:id', verifyAdminToken, deleteOutlet);

module.exports = router;

