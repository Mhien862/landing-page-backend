const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllSettings,
  getHeroBannerSettings,
  updateHeroBannerSettings,
  getSetting,
  updateSetting
} = require('../controllers/settingsController');

// Public routes
router.get('/hero-banner', getHeroBannerSettings);

// Protected routes
router.use(protect); // Tất cả routes dưới đây cần authentication

router.get('/', getAllSettings);
router.put('/hero-banner', updateHeroBannerSettings);
router.get('/:key', getSetting);
router.put('/:key', updateSetting);

module.exports = router; 