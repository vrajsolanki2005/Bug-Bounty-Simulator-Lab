const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin, requireAdmin } = require('../middleware/auth');
const { submitToPlatform } = require('../platformSubmit');

// Admin Dashboard
// VULNERABILITY: requireAdmin middleware can be bypassed via:
// 1. ?admin=true query parameter (if logged in as any user)
// 2. X-Admin-Override: supersecret2024 header
// 3. Setting role=admin cookie (if session can be manipulated)
router.get('/', requireLogin, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY id');
    const [products] = await db.query('SELECT id, name, category, price, stock FROM products ORDER BY id');
    const [orders] = await db.query('SELECT o.id, o.total, o.status, o.created_at, u.username FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.id DESC LIMIT 20');
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM products) as total_products,
        (SELECT COUNT(*) FROM orders) as total_orders,
        (SELECT SUM(total) FROM orders) as total_revenue
    `);
    const [flags] = await db.query('SELECT * FROM flags');

    // Admin flag - revealed in admin panel
    const adminFlag = 'flag{4dm1n_byp4ss_w34k_4uth_ch3ck_2024}';
    // Flag auto-detected by middleware

    res.render('admin/index', {
      user: req.session.user,
      title: 'Admin Panel',
      users,
      products,
      orders,
      stats: stats[0],
      flags,
      adminFlag,
      bypassMethod: req.query.admin === 'true' ? 'Query Parameter Bypass' : 
                    req.headers['x-admin-override'] ? 'Header Bypass' : 'Legitimate Admin Access',
      capturedFlag: req.session.capturedFlag || null
    });
    req.session.capturedFlag = null;
  } catch (err) {
    res.status(500).render('error', {
      user: req.session.user,
      title: 'Error',
      message: err.message,
      hint: null,
      code: 500
    });
  }
});

// Admin: Get all users (API)
router.get('/users', requireLogin, requireAdmin, async (req, res) => {
  try {
    // VULNERABILITY: Returns plaintext passwords in API response
    const [users] = await db.query('SELECT * FROM users');
    res.json({ users });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Admin: Update user role
router.post('/users/:id/role', requireLogin, requireAdmin, async (req, res) => {
  const { role } = req.body;
  try {
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Admin: Delete user
router.post('/users/:id/delete', requireLogin, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = ? AND role != "admin"', [req.params.id]);
    res.redirect('/admin?success=User+deleted');
  } catch (err) {
    res.redirect('/admin?error=' + encodeURIComponent(err.message));
  }
});

// Admin: Add product
router.post('/products/add', requireLogin, requireAdmin, async (req, res) => {
  const { name, description, price, original_price, category, image_url, stock } = req.body;
  try {
    await db.query(
      'INSERT INTO products (name, description, price, original_price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, original_price || price, category, image_url, stock || 100]
    );
    res.redirect('/admin?success=Product+added');
  } catch (err) {
    res.redirect('/admin?error=' + encodeURIComponent(err.message));
  }
});

// Admin: Update product
router.post('/products/:id/update', requireLogin, requireAdmin, async (req, res) => {
  const { name, price, stock, category } = req.body;
  try {
    await db.query(
      'UPDATE products SET name = ?, price = ?, stock = ?, category = ? WHERE id = ?',
      [name, price, stock, category, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Admin: Delete product
router.post('/products/:id/delete', requireLogin, requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.redirect('/admin?success=Product+deleted');
  } catch (err) {
    res.redirect('/admin?error=' + encodeURIComponent(err.message));
  }
});

// Admin: Update order status
router.post('/orders/:id/status', requireLogin, requireAdmin, async (req, res) => {
  const { status } = req.body;
  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// Admin: Get server info (intentional information disclosure)
router.get('/server-info', requireLogin, requireAdmin, (req, res) => {
  res.json({
    node_version: process.version,
    platform: process.platform,
    env: process.env.NODE_ENV || 'development',
    db_host: process.env.DB_HOST || 'localhost',
    db_name: process.env.DB_NAME || 'vulnshop',
    session_secret: 'vulnshop-super-secret-key-2024', // VULNERABILITY: Exposed secret
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

module.exports = router;
