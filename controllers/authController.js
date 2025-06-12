const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập username và password'
      });
    }

    // Tìm user
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Thông tin đăng nhập không đúng'
      });
    }

    // Kiểm tra password
    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Thông tin đăng nhập không đúng'
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy user'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Tạo user mới (chỉ admin và super_admin)
// @route   POST /api/auth/create-user
// @access  Private (Admin+)
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Kiểm tra quyền tạo user
    if (req.user.role === 'editor') {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền tạo user'
      });
    }

    // Super admin có thể tạo tất cả, admin chỉ có thể tạo editor
    if (req.user.role === 'admin' && (role === 'admin' || role === 'super_admin')) {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền tạo user với role này'
      });
    }

    // Kiểm tra username đã tồn tại
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username đã tồn tại'
      });
    }

    const userId = await User.createUser({ username, email, password, role });

    res.status(201).json({
      success: true,
      data: {
        id: userId,
        username,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};

// @desc    Lấy danh sách user
// @route   GET /api/auth/users
// @access  Private (Admin+)
exports.getUsers = async (req, res) => {
  try {
    if (req.user.role === 'editor') {
      return res.status(403).json({
        success: false,
        error: 'Không có quyền xem danh sách user'
      });
    }

    const users = await User.getAllUsers();
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi server'
    });
  }
};