const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');
const { submitToPlatform } = require('../platformSubmit');

// Order history - only shows user's own orders
router.get('/', requireLogin, async (req, res) => {
  const userId = req.session.user.id;

  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    res.render('orders/index', {
      user: req.session.user,
      title: 'Your Orders',
      orders
    });
  } catch (err) {
    res.render('orders/index', {
      user: req.session.user,
      title: 'Your Orders',
      orders: [],
      error: err.message
    });
  }
});

// VULNERABILITY: IDOR - Order detail by ID with no ownership check
// Access /orders/1 to see admin's order (which contains a flag in the notes)
// Even if you only have orders with ID 5+, you can access /orders/1
router.get('/:id', requireLogin, async (req, res) => {
  const orderId = req.params.id;
  // const userId = req.session.user.id; // INTENTIONALLY NOT USED FOR OWNERSHIP CHECK

  try {
    // VULNERABILITY: No WHERE user_id = userId check
    const [orders] = await db.query(
      'SELECT o.*, u.username as owner_username, u.email as owner_email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).render('error', {
        user: req.session.user,
        title: 'Order Not Found',
        message: 'Order not found.',
        hint: null,
        code: 404
      });
    }

    const order = orders[0];

    const [items] = await db.query(
      'SELECT oi.*, p.image_url FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [orderId]
    );

    // Check if this is the IDOR challenge (order #1 belongs to admin)
    const isIdorExploit = order.user_id === 1 && req.session.user.id !== 1;
    // Flag auto-detected by middleware

    res.render('orders/show', {
      user: req.session.user,
      title: `Order #${orderId}`,
      order,
      items,
      isNew: req.query.new === 'true',
      isIdorExploit,
      idorFlag: isIdorExploit ? 'flag{1d0r_0rd3r_4cc3ss_s3qu3nt14l_1d_2024}' : null,
      capturedFlag: req.session.capturedFlag || null
    });
    req.session.capturedFlag = null;
  } catch (err) {
    res.status(500).render('error', {
      user: req.session.user,
      title: 'Error',
      message: `Error: ${err.message}`,
      hint: null,
      code: 500
    });
  }
});

// API endpoint - also vulnerable to IDOR
router.get('/api/:id', requireLogin, async (req, res) => {
  const orderId = req.params.id;
  // VULNERABILITY: No ownership check in API either
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    
    if (orders.length === 0) {
      return res.json({ error: 'Order not found' });
    }

    res.json({ order: orders[0], items });
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;
