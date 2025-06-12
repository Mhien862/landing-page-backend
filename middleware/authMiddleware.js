const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            // Lấy token từ header (Bearer <token>)
            token = authHeader.split(' ')[1];

            // Xác thực token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Lấy thông tin user từ database
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ 
                    success: false,
                    error: 'Token không hợp lệ, user không tồn tại' 
                });
            }

            // Gắn thông tin người dùng vào request
            req.user = {
                id: user.id,
                username: user.username,
                role: user.role
            };
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ 
                success: false,
                error: 'Token không hợp lệ' 
            });
        }
    }

    if (!token) {
        return res.status(401).json({ 
            success: false,
            error: 'Không có token, truy cập bị từ chối' 
        });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
        next();
    } else {
        res.status(403).json({ 
            success: false,
            error: 'Cần quyền admin để truy cập' 
        });
    }
};

const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'super_admin') {
        next();
    } else {
        res.status(403).json({ 
            success: false,
            error: 'Cần quyền super admin để truy cập' 
        });
    }
};

module.exports = { protect, isAdmin, isSuperAdmin };