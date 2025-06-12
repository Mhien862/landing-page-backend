const db = require('../config/db');

class Article {
  constructor() {
    // Don't call createTable in constructor to avoid async issues
  }

  static async createTable() {
    try {
      // First, try to modify existing table structure
      const alterQueries = [
        'ALTER TABLE articles MODIFY COLUMN title TEXT NOT NULL',
        'ALTER TABLE articles MODIFY COLUMN content LONGTEXT NOT NULL', 
        'ALTER TABLE articles MODIFY COLUMN featured_image VARCHAR(1000)'
      ];

      for (const query of alterQueries) {
        try {
          await db.execute(query);
        } catch (alterError) {
          // If alter fails, table might not exist, so we'll create it
          console.log('Alter table failed, will create new table:', alterError.message);
        }
      }
    } catch (error) {
      console.log('Table alteration failed, creating new table');
    }

    // Create table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        excerpt TEXT,
        featured_image VARCHAR(1000),
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        author_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        published_at TIMESTAMP NULL,
        views INT DEFAULT 0,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_status (status),
        INDEX idx_author (author_id),
        INDEX idx_published_at (published_at)
      )
    `;

    try {
      await db.execute(createTableQuery);
      console.log('Bảng articles đã được tạo hoặc đã tồn tại');
    } catch (error) {
      console.error('Lỗi khi tạo bảng articles:', error);
    }
  }

  // Tạo bài viết mới
  static async create(articleData) {
    const { title, content, excerpt, featured_image, status, author_id } = articleData;
    
    const published_at = status === 'published' ? new Date() : null;
    
    const query = `
      INSERT INTO articles (title, content, excerpt, featured_image, status, author_id, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      title || null,
      content || null,
      excerpt || null,
      featured_image || null,
      status || 'draft',
      author_id,
      published_at
    ]);
    
    return result.insertId;
  }

  // Lấy danh sách bài viết với phân trang và lọc
  static async getAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      status = null,
      author_id = null,
      search = null
    } = options;

    // Ensure page and limit are integers
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 10;
    const offset = (pageInt - 1) * limitInt;
    
    let whereConditions = [];
    let queryParams = [];

    if (status) {
      whereConditions.push('a.status = ?');
      queryParams.push(status);
    }

    if (author_id) {
      whereConditions.push('a.author_id = ?');
      queryParams.push(parseInt(author_id));
    }

    if (search) {
      whereConditions.push('(a.title LIKE ? OR a.content LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    const query = `
      SELECT 
        a.*,
        u.username as author_name,
        u.email as author_email
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ${limitInt} OFFSET ${offset}
    `;

    // Only use queryParams for WHERE conditions (not for LIMIT/OFFSET)
    const [articles] = await db.execute(query, queryParams);

    // Lấy tổng số bài viết để tính pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM articles a
      ${whereClause}
    `;
    
    // Chỉ sử dụng queryParams cho count query (không cần limit và offset)
    const [countResult] = await db.execute(countQuery, queryParams);

    return {
      articles,
      total: countResult[0].total,
      page: pageInt,
      limit: limitInt,
      totalPages: Math.ceil(countResult[0].total / limitInt)
    };
  }

  // Lấy bài viết theo ID
  static async getById(id) {
    const query = `
      SELECT 
        a.*,
        u.username as author_name,
        u.email as author_email
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      WHERE a.id = ?
    `;
    
    const [articles] = await db.execute(query, [id]);
    return articles[0] || null;
  }

  // Cập nhật bài viết
  static async update(id, articleData, user_role, user_id) {
    const { title, content, excerpt, featured_image, status } = articleData;
    
    // Kiểm tra quyền chỉnh sửa
    if (user_role === 'editor') {
      // Editor chỉ có thể chỉnh sửa bài viết của mình
      const article = await Article.getById(id);
      if (!article || article.author_id !== user_id) {
        throw new Error('Bạn không có quyền chỉnh sửa bài viết này');
      }
    }

    const published_at = status === 'published' ? new Date() : null;
    
    const query = `
      UPDATE articles 
      SET title = ?, content = ?, excerpt = ?, featured_image = ?, status = ?, published_at = ?
      WHERE id = ?
    `;
    
    const [result] = await db.execute(query, [
      title || null,
      content || null,
      excerpt || null,
      featured_image || null,
      status || 'draft',
      published_at,
      id
    ]);
    
    return result.affectedRows > 0;
  }

  // Xóa bài viết  
  static async delete(id, user_role, user_id) {
    // Kiểm tra quyền xóa
    if (user_role === 'editor') {
      // Editor chỉ có thể xóa bài viết của mình
      const article = await Article.getById(id);
      if (!article || article.author_id !== user_id) {
        throw new Error('Bạn không có quyền xóa bài viết này');
      }
    }

    const query = 'DELETE FROM articles WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    
    return result.affectedRows > 0;
  }

  // Lấy bài viết công khai cho trang tin tức
  static async getPublishedArticles(options = {}) {
    const { page = 1, limit = 12, search = null } = options;
    
    // Ensure page and limit are integers
    const pageInt = parseInt(page) || 1;
    const limitInt = parseInt(limit) || 12;
    const offset = (pageInt - 1) * limitInt;
    
    let whereConditions = ['a.status = ?'];
    let queryParams = ['published'];

    if (search) {
      whereConditions.push('(a.title LIKE ? OR a.excerpt LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const query = `
      SELECT 
        a.id,
        a.title,
        a.excerpt,
        a.featured_image,
        a.published_at,
        a.views,
        u.username as author_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      ${whereClause}
      ORDER BY a.published_at DESC
      LIMIT ${limitInt} OFFSET ${offset}
    `;

    // Only use queryParams for WHERE conditions (not for LIMIT/OFFSET)
    const [articles] = await db.execute(query, queryParams);

    // Lấy tổng số bài viết công khai
    const countQuery = `
      SELECT COUNT(*) as total
      FROM articles a
      ${whereClause}
    `;
    
    // Chỉ sử dụng queryParams cho count query (không cần limit và offset)
    const [countResult] = await db.execute(countQuery, queryParams);

    return {
      articles,
      total: countResult[0].total,
      page: pageInt,
      limit: limitInt,
      totalPages: Math.ceil(countResult[0].total / limitInt)
    };
  }

  // Tăng lượt xem
  static async incrementViews(id) {
    const query = 'UPDATE articles SET views = views + 1 WHERE id = ?';
    await db.execute(query, [id]);
  }
}

module.exports = Article;