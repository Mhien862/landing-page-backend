const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const {
  login,
  getMe,
  createUser,
  getUsers
} = require('../controllers/authController');

// Public routes
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.post('/create-user', protect, isAdmin, createUser);
router.get('/users', protect, isAdmin, getUsers);

module.exports = router;