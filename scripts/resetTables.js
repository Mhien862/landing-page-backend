const db = require('../config/db');

async function resetTables() {
  try {
    console.log('Đang xóa bảng cũ...');
    
    // Tắt foreign key checks
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Xóa bảng settings trước (có foreign key)
    await db.execute('DROP TABLE IF EXISTS settings'); 
    console.log('Đã xóa bảng settings');
    
    // Xóa bảng users 
    await db.execute('DROP TABLE IF EXISTS users');
    console.log('Đã xóa bảng users');
    
    // Bật lại foreign key checks
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Reset tables hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi reset tables:', error);
    process.exit(1);
  }
}

resetTables(); 