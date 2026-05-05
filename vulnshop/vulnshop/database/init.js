/**
 * VulnShop — Database Initializer
 * Runs init.sql statement-by-statement — works on all MySQL/MariaDB versions.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mysql = require('mysql2/promise');
const fs    = require('fs');
const path  = require('path');

async function initDatabase() {
  const cfg = {
    host              : process.env.DB_HOST     || 'localhost',
    port              : parseInt(process.env.DB_PORT || '3306'),
    user              : process.env.DB_USER     || 'root',
    password          : process.env.DB_PASSWORD || '',
    connectTimeout    : 10000,
    multipleStatements: true,
  };

  console.log(`\n Connecting to MySQL at ${cfg.host}:${cfg.port} as "${cfg.user}"...`);

  let conn;
  try {
    conn = await mysql.createConnection(cfg);
    console.log('Connected!\n');
  } catch (e) {
    console.error(`\nConnection failed: ${e.message}`);
    console.log('\nFix options:');
    console.log('  1. Run  node setup.js  (auto-detects your MySQL password)');
    console.log('  2. Edit .env  and set DB_USER / DB_PASSWORD to match your MySQL');
    console.log('  3. Import database/init.sql manually in phpMyAdmin\n');
    process.exit(1);
  }

  await conn.query(
    'CREATE DATABASE IF NOT EXISTS vulnshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
  );
  await conn.query('USE vulnshop');
  console.log('Database "vulnshop" selected\n');

  const raw = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
  await conn.query(raw);

  const [[p]] = await conn.query('SELECT COUNT(*) n FROM products');
  const [[u]] = await conn.query('SELECT COUNT(*) n FROM users');
  const [[f]] = await conn.query('SELECT COUNT(*) n FROM flags');
  await conn.end();

  console.log('Schema and seed data loaded.');
  console.log(`  Products: ${p.n}  |  Users: ${u.n}  |  Flags: ${f.n}`);
  console.log(`\n VulnShop DB ready!  Run: node server.js\n`);
}

initDatabase().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
