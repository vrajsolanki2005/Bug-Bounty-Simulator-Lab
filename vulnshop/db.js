require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host              : process.env.DB_HOST     || 'localhost',
  port              : parseInt(process.env.DB_PORT || '3306'),
  user              : process.env.DB_USER     || 'root',
  password          : process.env.DB_PASSWORD || '',
  database          : process.env.DB_NAME     || 'vulnshop',
  waitForConnections: true,
  connectionLimit   : 10,
  queueLimit        : 0,
  connectTimeout    : 10000,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('\n❌ Database connection failed!');
    console.error('   Error:', err.message);
    console.error('\n   Fix: Update DB_PASSWORD in your .env file with your MySQL root password, then restart.\n');
    process.exit(1);
  }
  console.log('✅ MySQL connected  →  ' +
    (process.env.DB_USER || 'root') + '@' +
    (process.env.DB_HOST || 'localhost') + ':' +
    (process.env.DB_PORT || '3306') + '/' +
    (process.env.DB_NAME || 'vulnshop'));
  connection.release();
});

module.exports = pool.promise();
