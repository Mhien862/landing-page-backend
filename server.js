const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db');
const contactRoutes = require('./routes/contactRoutes');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const articleRoutes = require('./routes/articleRoutes');

// Import models để khởi tạo
const User = require('./models/userModel');
const Settings = require('./models/settingsModel');
const Article = require('./models/articleModel');

// Tải biến môi trường
dotenv.config();

// Khởi tạo app Express
const app = express();

// Logging middleware để debug (chỉ trong development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    next();
  });
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app', 'https://localhost:5173'] 
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json()); // Cho phép server đọc dữ liệu JSON từ request body

// Middleware để log body của request (chỉ trong development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('Request body:', req.body);
    next();
  });
}

// Khởi tạo database và tạo bảng
const initializeDatabase = async () => {
  try {
    await User.createTable();
    await Settings.createTable();
    // Article table is created in the Article constructor, but we should ensure it's ready
    await Article.createTable();
    await User.createSuperAdmin();
    await Settings.initializeDefaultSettings();
    console.log('Database đã được khởi tạo');
  } catch (error) {
    console.error('Lỗi khởi tạo database:', error);
  }
};

// Test database connection
db.query('SELECT 1')
  .then(() => {
    console.log('Đã kết nối với MySQL database');
    initializeDatabase();
  })
  .catch((err) => {
    console.error('Lỗi kết nối MySQL:', err);
  });

// Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/articles', articleRoutes);

// Test route để kiểm tra API có hoạt động không
app.post('/api/test', (req, res) => {
  console.log('Test route called');
  res.json({ message: 'Test route hoạt động', body: req.body });
});

// Route cơ bản để kiểm tra server
app.get('/', (req, res) => {
    res.send('API đang chạy...');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));