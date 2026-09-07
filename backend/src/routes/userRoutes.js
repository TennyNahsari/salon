const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyAdminToken, requireSuperAdmin } = require('../middleware/authMiddleware');

// All user management routes require valid token + Super Admin role
router.use(verifyAdminToken);
router.use(requireSuperAdmin);

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
