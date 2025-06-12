const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false // Cần thiết cho Aiven với ssl-mode=REQUIRED
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Tạo bảng contacts nếu chưa tồn tại
const createContactsTable = async () => {
    try {
        await pool.promise().execute(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Bảng contacts đã được tạo hoặc đã tồn tại');
    } catch (error) {
        console.error('Lỗi tạo bảng contacts:', error);
    }
};

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
    }
    console.log('Successfully connected to the database.');
    connection.release();
    
    // Tạo bảng sau khi kết nối thành công
    createContactsTable();
});


module.exports = pool.promise();