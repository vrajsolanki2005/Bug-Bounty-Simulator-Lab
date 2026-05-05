const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:            process.env.DB_HOST     || '127.0.0.1',
  port:            parseInt(process.env.DB_PORT || '3306'),
  database:        process.env.DB_NAME     || 'bugbounty_simulator',
  user:            process.env.DB_USER     || 'root',
  password:        process.env.DB_PASS ,
  waitForConnections: true,
  connectionLimit:    20,
  queueLimit:         0,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0,
  timezone: 'Z'
});

// Test the connection on startup
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('MySQL connected successfully');
    conn.release();
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    process.exit(1);
  }
})();

module.exports = pool;
