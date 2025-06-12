const db = require('../config/db');

class Settings {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        key_name VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        description VARCHAR(255),
        updated_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `;
    await db.execute(query);
  }

  static async initializeDefaultSettings() {
    try {
      // Kiểm tra xem có setting nào chưa
      const [existing] = await db.execute('SELECT COUNT(*) as count FROM settings');
      
      if (existing[0].count === 0) {
        // Tạo setting mặc định cho banner
        const defaultSettings = [
          {
            key_name: 'hero_banner_image',
            value: 'https://images.unsplash.com/photo-1573671935871-77305106a2f2?q=80&w=3528&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'URL ảnh banner hero section'
          },
          {
            key_name: 'hero_banner_title',
            value: 'DỊCH VỤ THIẾT KẾ WEB LANDING PAGE CHUYÊN NGHIỆP',
            description: 'Tiêu đề banner hero section'
          },
          {
            key_name: 'hero_banner_subtitle',
            value: 'Chuyên thiết kế Web Landing Page giới thiệu sản phẩm dịch vụ giúp bán hàng online hiệu quả và tiết kiệm chi phí nhất.',
            description: 'Mô tả banner hero section'
          }
        ];

        for (const setting of defaultSettings) {
          await db.execute(
            'INSERT INTO settings (key_name, value, description) VALUES (?, ?, ?)',
            [setting.key_name, setting.value, setting.description]
          );
        }
        console.log('Đã tạo settings mặc định');
      }
    } catch (error) {
      console.error('Lỗi tạo settings mặc định:', error);
    }
  }

  static async getSetting(keyName) {
    const [rows] = await db.execute('SELECT * FROM settings WHERE key_name = ?', [keyName]);
    return rows[0];
  }

  static async getAllSettings() {
    const [rows] = await db.execute('SELECT * FROM settings ORDER BY key_name');
    return rows;
  }

  static async updateSetting(keyName, value, updatedBy) {
    await db.execute(
      'UPDATE settings SET value = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE key_name = ?',
      [value, updatedBy, keyName]
    );
  }

  static async createSetting(keyName, value, description, updatedBy) {
    const [result] = await db.execute(
      'INSERT INTO settings (key_name, value, description, updated_by) VALUES (?, ?, ?, ?)',
      [keyName, value, description, updatedBy]
    );
    return result.insertId;
  }

  static async deleteSetting(keyName) {
    await db.execute('DELETE FROM settings WHERE key_name = ?', [keyName]);
  }

  static async getHeroBannerSettings() {
    const [rows] = await db.execute(
      'SELECT * FROM settings WHERE key_name LIKE ? ORDER BY key_name',
      ['hero_banner_%']
    );
    return rows;
  }
}

module.exports = Settings; 