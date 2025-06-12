const Article = require('../models/articleModel');

// Lấy danh sách bài viết (cho admin)
exports.getArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const { role, id: user_id } = req.user;

    const options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      status: status || null,
      search: search || null
    };

    // Editor chỉ xem được bài viết của mình
    if (role === 'editor') {
      options.author_id = parseInt(user_id);
    }

    const result = await Article.getAll(options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getArticles:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách bài viết',
      error: error.message
    });
  }
};

// Lấy bài viết theo ID (cho admin)
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: user_id } = req.user;

    const article = await Article.getById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Editor chỉ xem được bài viết của mình
    if (role === 'editor' && article.author_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem bài viết này'
      });
    }

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error in getArticleById:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bài viết',
      error: error.message
    });
  }
};

// Tạo bài viết mới
exports.createArticle = async (req, res) => {
  try {
    const { title, content, excerpt, featured_image, status = 'draft' } = req.body;
    const { id: author_id } = req.user;

    // Validate dữ liệu
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và nội dung là bắt buộc'
      });
    }

    const articleData = {
      title,
      content,
      excerpt,
      featured_image,
      status,
      author_id
    };

    const articleId = await Article.create(articleData);

    res.status(201).json({
      success: true,
      message: 'Tạo bài viết thành công',
      data: { id: articleId }
    });
  } catch (error) {
    console.error('Error in createArticle:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo bài viết',
      error: error.message
    });
  }
};

// Cập nhật bài viết
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, featured_image, status } = req.body;
    const { role, id: user_id } = req.user;

    // Validate dữ liệu
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và nội dung là bắt buộc'
      });
    }

    const articleData = {
      title,
      content,
      excerpt,
      featured_image,
      status
    };

    const updated = await Article.update(id, articleData, role, user_id);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết để cập nhật'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật bài viết thành công'
    });
  } catch (error) {
    console.error('Error in updateArticle:', error);
    
    if (error.message.includes('không có quyền')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật bài viết',
      error: error.message
    });
  }
};

// Xóa bài viết
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, id: user_id } = req.user;

    const deleted = await Article.delete(id, role, user_id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết để xóa'
      });
    }

    res.json({
      success: true,
      message: 'Xóa bài viết thành công'
    });
  } catch (error) {
    console.error('Error in deleteArticle:', error);
    
    if (error.message.includes('không có quyền')) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa bài viết',
      error: error.message
    });
  }
};

// Lấy bài viết công khai (cho trang tin tức)
exports.getPublishedArticles = async (req, res) => {
  try {
    const { page = 1, limit = 12, search } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      search
    };

    const result = await Article.getPublishedArticles(options);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getPublishedArticles:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách tin tức',
      error: error.message
    });
  }
};

// Lấy chi tiết bài viết công khai
exports.getPublishedArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.getById(id);

    if (!article || article.status !== 'published') {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }

    // Tăng lượt xem
    await Article.incrementViews(id);

    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Error in getPublishedArticleById:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy bài viết',
      error: error.message
    });
  }
}; 