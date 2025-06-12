const db = require('../config/db');

// @desc    Tạo liên hệ mới
// @route   POST /api/contacts
// @access  Public
exports.createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate input
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email không hợp lệ'
      });
    }

    // Validate phone format
    const phoneRegex = /^[0-9]{9,11}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        error: 'Số điện thoại không hợp lệ'
      });
    }

    // Insert into database
    const [result] = await db.execute(
      'INSERT INTO contacts (name, email, phone, message) VALUES (?, ?, ?, ?)',
      [name, email, phone, message]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        name,
        email,
        phone,
        message
      }
    });
  } catch (error) {
    console.error('Error in createContact:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy tất cả contacts
// @route   GET /api/contacts
// @access  Private
exports.getAllContacts = async (req, res) => {
  try {
    const [contacts] = await db.execute(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('Error in getAllContacts:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
}; 