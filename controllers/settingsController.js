const Settings = require('../models/settingsModel');

// @desc    Lấy tất cả settings
// @route   GET /api/settings
// @access  Private
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.getAllSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error in getAllSettings:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy settings hero banner
// @route   GET /api/settings/hero-banner
// @access  Public
exports.getHeroBannerSettings = async (req, res) => {
  try {
    console.log('Getting hero banner settings...');
    const settings = await Settings.getHeroBannerSettings();
    console.log('Hero banner settings from DB:', settings);
    
    // Convert array thành object để dễ sử dụng
    const bannerData = {};
    settings.forEach(setting => {
      const key = setting.key_name.replace('hero_banner_', '');
      bannerData[key] = setting.value;
    });

    console.log('Converted banner data:', bannerData);
    res.json({
      success: true,
      data: bannerData
    });
  } catch (error) {
    console.error('Error in getHeroBannerSettings:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Cập nhật hero banner settings
// @route   PUT /api/settings/hero-banner
// @access  Private
exports.updateHeroBannerSettings = async (req, res) => {
  try {
    const { image, title, subtitle } = req.body;

    // Validate input
    if (!image || !title || !subtitle) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin banner'
      });
    }

    // Update settings
    await Settings.updateSetting('hero_banner_image', image, req.user.id);
    await Settings.updateSetting('hero_banner_title', title, req.user.id);
    await Settings.updateSetting('hero_banner_subtitle', subtitle, req.user.id);

    res.json({
      success: true,
      message: 'Đã cập nhật banner thành công'
    });
  } catch (error) {
    console.error('Error in updateHeroBannerSettings:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy một setting theo key
// @route   GET /api/settings/:key
// @access  Private
exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Settings.getSetting(key);
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy setting'
      });
    }

    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Error in getSetting:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Cập nhật một setting
// @route   PUT /api/settings/:key
// @access  Private
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng cung cấp giá trị'
      });
    }

    await Settings.updateSetting(key, value, req.user.id);

    res.json({
      success: true,
      message: 'Đã cập nhật setting thành công'
    });
  } catch (error) {
    console.error('Error in updateSetting:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
}; 