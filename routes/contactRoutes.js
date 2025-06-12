const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createContact, getAllContacts } = require('../controllers/contactController');

// Public route
router.post('/', createContact);

// Protected route
router.get('/', protect, getAllContacts);

module.exports = router; 