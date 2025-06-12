const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');

// Routes công khai (không cần đăng nhập)
router.get('/public', articleController.getPublishedArticles);
router.get('/public/:id', articleController.getPublishedArticleById);

// Routes cho admin (cần đăng nhập)
router.use(protect); // Áp dụng middleware xác thực cho tất cả routes phía dưới

router.get('/', articleController.getArticles);
router.get('/:id', articleController.getArticleById);
router.post('/', articleController.createArticle);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

module.exports = router; 