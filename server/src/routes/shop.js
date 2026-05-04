const express = require('express');
const router = express.Router();
const db = require('../config/database');
const flagService = require('../services/flagService');
const { authenticate } = require('../middleware/auth');

/**
 * VULNERABLE E-COMMERCE API
 */

// Helper to get correct flag
const getFlagForSlug = async (userId, slug) => {
  const [rows] = await db.query('SELECT id, slug FROM challenges WHERE slug = ?', [slug]);
  if (!rows.length) return null;
  return flagService.generateFlag(userId, rows[0].id, rows[0].slug);
};

// 1. Get All Products
router.get('/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Search Products - VULNERABLE TO SQLi AND Reflected XSS
router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    // SQLi Flaw: String concatenation
    const query = `SELECT * FROM products WHERE name LIKE '%${q}%' OR description LIKE '%${q}%'`;
    const [rows] = await db.query(query);
    
    let flag = null;
    if (q.includes("'") || q.includes("--") || q.includes("UNION")) {
      flag = await getFlagForSlug(req.user?.id || 1, 'sqli-login');
    }

    // Reflected XSS Flaw: The query 'q' is reflected back without escaping in the frontend
    if (q.includes('<script>') || q.includes('onerror=')) {
        const xssFlag = await getFlagForSlug(req.user?.id || 1, 'xss-reflected');
        return res.json({ success: true, data: rows, flag: xssFlag, message: `Results for ${q}` });
    }

    res.json({ success: true, data: rows, flag, message: `Results for ${q}` });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// 3. Post Review - VULNERABLE TO Stored XSS
router.post('/review', async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user?.id || 1;
  try {
    await db.query('INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?,?,?,?)', [productId, userId, rating, comment]);
    
    let flag = null;
    if (comment.includes('<script>') || comment.includes('onerror=')) {
      flag = await getFlagForSlug(userId, 'stored-xss');
    }
    res.json({ success: true, message: 'Review posted!', flag });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Get Order History - VULNERABLE TO IDOR
router.get('/order/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    const [order] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (order.length === 0) return res.status(404).json({ message: 'Order not found' });
    
    const [items] = await db.query('SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?', [orderId]);
    
    let flag = null;
    if (orderId == 1) { 
      flag = await getFlagForSlug(req.user?.id || 1, 'idor-advanced');
    }
    res.json({ success: true, data: { ...order[0], items }, flag });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Checkout - VULNERABLE TO Business Logic Flaw
router.post('/checkout', async (req, res) => {
  const { cartItems, totalAmount } = req.body;
  const userId = req.user?.id || 1;
  try {
    const [result] = await db.query('INSERT INTO orders (user_id, total_amount, status) VALUES (?,?,?)', [userId, totalAmount, 'paid']);
    const orderId = result.insertId;
    
    let flag = null;
    if (parseFloat(totalAmount) <= 0) {
      flag = await getFlagForSlug(userId, 'logic-flaw');
    }
    res.json({ success: true, message: 'Order placed successfully!', orderId, flag });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. Admin Panel Stats - VULNERABLE TO Auth Bypass
router.get('/admin/stats', async (req, res) => {
  const authHeader = req.headers['x-admin-key'];
  const isAdminCookie = req.headers.cookie?.includes('isAdmin=true');

  if (authHeader === 'admin-secret-key-123' || isAdminCookie) {
     const flag = await getFlagForSlug(req.user?.id || 1, 'auth-bypass');
     return res.json({ success: true, stats: { sales: 5000, users: 150, uptime: '99.9%' }, flag });
  }
  res.status(403).json({ message: 'Unauthorized' });
});

// 7. Update Profile - VULNERABLE TO CSRF
router.post('/profile/update', async (req, res) => {
    const { email, username } = req.body;
    const userId = req.user?.id || 1;
    try {
        // Flaw: No CSRF token check
        await db.query('UPDATE users SET email = ?, username = ? WHERE id = ?', [email, username, userId]);
        
        // If the email is set to an attacker controlled one via a hidden form, it's CSRF
        let flag = null;
        if (req.headers['referer'] && !req.headers['referer'].includes(req.headers.host)) {
            flag = await getFlagForSlug(userId, 'csrf-basic');
        }
        res.json({ success: true, message: 'Profile updated!', flag });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 8. Fetch Image - VULNERABLE TO SSRF
router.post('/image/fetch', async (req, res) => {
  const { url } = req.body;
  try {
    if (url.includes('169.254.169.254') || url.includes('localhost') || url.includes('127.0.0.1')) {
       const flag = await getFlagForSlug(req.user?.id || 1, 'ssrf-internal');
       return res.json({ success: true, image_data: "INTERNAL_DATA_LEAK: {\"db_pass\": \"root123\", \"aws_key\": \"AKIA...\"}", flag });
    }
    res.json({ success: true, message: "External asset synchronized." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 9. Upload Avatar - VULNERABLE TO File Upload Bypass
router.post('/avatar/upload', async (req, res) => {
  const { filename, filedata } = req.body;
  try {
    if (filename.includes('.php') || filename.includes('.sh') || filename.includes('.aspx')) {
       const flag = await getFlagForSlug(req.user?.id || 1, 'upload-bypass');
       return res.json({ success: true, message: `File ${filename} uploaded to /var/www/uploads/ (Exploitable!)`, flag });
    }
    res.json({ success: true, message: "Avatar uploaded." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
