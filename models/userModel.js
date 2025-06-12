const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('super_admin', 'admin', 'editor') DEFAULT 'editor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await db.execute(query);
  }

  static async createSuperAdmin() {
    try {
      const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'admin123456', 12);
      
      const [existing] = await db.execute(
        'SELECT id FROM users WHERE username = ? OR role = ?',
        [process.env.SUPER_ADMIN_USERNAME || 'superadmin', 'super_admin']
      );

      if (existing.length === 0) {
        await db.execute(
          'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
          [
            process.env.SUPER_ADMIN_USERNAME || 'superadmin',
            'superadmin@landingpage.com',
            hashedPassword,
            'super_admin'
          ]
        );
        console.log('Super admin đã được tạo');
      }
    } catch (error) {
      console.error('Lỗi tạo super admin:', error);
    }
  }

  static async findByUsername(username) {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async createUser(userData) {
    const { username, email, password, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );
    
    return result.insertId;
  }

  static async getAllUsers() {
    const [rows] = await db.execute('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
    return rows;
  }

  static async updateUser(id, userData) {
    const { username, email, role } = userData;
    await db.execute(
      'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
      [username, email, role, id]
    );
  }

  static async deleteUser(id) {
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User; 