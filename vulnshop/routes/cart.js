const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/auth');

// View cart
router.get('/', requireLogin, async (req, res) => {
  const userId = req.session.user.id;

  try {
    const [items] = await db.query(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url, p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `, [userId]);

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.render('cart/index', {
      user: req.session.user,
      title: 'Shopping Cart',
      items,
      subtotal,
      couponApplied: req.session.coupon || null,
      businessLogicFlag: req.session.businessLogicFlag || null
    });
  } catch (err) {
    res.render('cart/index', {
      user: req.session.user,
      title: 'Shopping Cart',
      items: [],
      subtotal: 0,
      couponApplied: null,
      businessLogicFlag: null
    });
  }
});

// Add to cart
router.post('/add', requireLogin, async (req, res) => {
  const userId = req.session.user.id;
  // VULNERABILITY: Quantity not validated - can send negative values
  const { product_id, quantity } = req.body;
  const qty = parseInt(quantity) || 1;

  try {
    // Check if item already in cart
    const [existing] = await db.query(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, product_id]
    );

    if (existing.length > 0) {
      // VULNERABILITY: No check if quantity + existing goes negative
      const newQty = existing[0].quantity + qty;
      if (newQty <= 0) {
        await db.query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, product_id]);
      } else {
        await db.query(
          'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
          [newQty, userId, product_id]
        );
      }
    } else {
      await db.query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, product_id, qty]
      );
    }

    res.json({ success: true, message: 'Item added to cart' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Update quantity
router.post('/update', requireLogin, async (req, res) => {
  const userId = req.session.user.id;
  // VULNERABILITY: Negative quantity allowed → negative price calculation
  const { item_id, quantity } = req.body;
  const qty = parseInt(quantity);

  try {
    if (qty <= 0) {
      await db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [item_id, userId]);
    } else {
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
        [qty, item_id, userId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Remove item
router.post('/remove', requireLogin, async (req, res) => {
  const userId = req.session.user.id;
  const { item_id } = req.body;

  try {
    await db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [item_id, userId]);
    res.redirect('/cart');
  } catch (err) {
    res.redirect('/cart?error=Failed to remove item');
  }
});

// Apply coupon
// VULNERABILITY: Business logic flaw - no per-user coupon usage tracking
// Coupon FLASH50 gives 50% off, can be applied repeatedly
router.post('/coupon', requireLogin, async (req, res) => {
  const { coupon_code } = req.body;

  try {
    // VULNERABILITY: No check if this user already used this coupon
    const [coupons] = await db.query(
      'SELECT * FROM coupons WHERE code = ?',
      [coupon_code.toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.json({ success: false, message: 'Invalid coupon code.' });
    }

    const coupon = coupons[0];

    // Only check total uses, not per-user (vulnerability)
    if (coupon.used_count >= coupon.max_uses) {
      return res.json({ success: false, message: 'This coupon has expired.' });
    }

    // Apply coupon to session
    req.session.coupon = {
      code: coupon.code,
      discount_percent: coupon.discount_percent,
      discount_amount: coupon.discount_amount
    };

    // Increment total usage (but doesn't track per user)
    await db.query('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?', [coupon_code.toUpperCase()]);

    // Business logic flag - if FLASH50 coupon used (which gives 50% off)
    if (coupon.code === 'FLASH50') {
      req.session.businessLogicFlag = 'flag{bus1n3ss_l0g1c_pr1c3_m4n1p_2024}';
    }

    res.json({
      success: true,
      message: `Coupon applied! ${coupon.discount_percent ? coupon.discount_percent + '% off' : '$' + coupon.discount_amount + ' off'}`,
      coupon: req.session.coupon
    });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Remove coupon
router.post('/coupon/remove', requireLogin, (req, res) => {
  delete req.session.coupon;
  delete req.session.businessLogicFlag;
  res.redirect('/cart');
});

// Checkout page
router.get('/checkout', requireLogin, async (req, res) => {
  const userId = req.session.user.id;

  try {
    const [items] = await db.query(`
      SELECT ci.id, ci.quantity, p.id as product_id, p.name, p.price, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `, [userId]);

    if (items.length === 0) {
      return res.redirect('/cart');
    }

    let subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // VULNERABILITY: Business logic flaw - allow negative totals via coupon abuse
    let discount = 0;
    if (req.session.coupon) {
      const c = req.session.coupon;
      if (c.discount_percent) {
        discount = subtotal * (c.discount_percent / 100);
      } else if (c.discount_amount) {
        discount = c.discount_amount;
      }
    }

    const shipping = subtotal > 35 ? 0 : 5.99;
    const tax = subtotal * 0.08;
    // VULNERABILITY: Total can become negative with aggressive coupon
    const total = Math.max(subtotal - discount + shipping + tax, 0);

    const [userInfo] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

    res.render('cart/checkout', {
      user: req.session.user,
      title: 'Checkout',
      items,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      coupon: req.session.coupon || null,
      userInfo: userInfo[0],
      businessLogicFlag: req.session.businessLogicFlag || null
    });
  } catch (err) {
    res.redirect('/cart?error=' + encodeURIComponent(err.message));
  }
});

// Place order
router.post('/checkout', requireLogin, async (req, res) => {
  const userId = req.session.user.id;
  // VULNERABILITY: Price taken from POST body, not recalculated server-side
  const { shipping_address, payment_last4, payment_method } = req.body;
  // Attacker can submit manipulated 'total' from client side
  const clientTotal = parseFloat(req.body.total) || 0;

  try {
    const [items] = await db.query(`
      SELECT ci.quantity, p.id as product_id, p.name, p.price
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `, [userId]);

    if (items.length === 0) {
      return res.redirect('/cart');
    }

    // VULNERABILITY: Use client-provided total (should recalculate server-side)
    let serverTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Trust client total (vulnerability) - allows price manipulation
    const finalTotal = clientTotal || serverTotal;

    // Create order
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total, shipping_address, payment_last4, payment_method) VALUES (?, ?, ?, ?, ?)',
      [userId, finalTotal, shipping_address, payment_last4 || '0000', payment_method || 'card']
    );
    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.name, item.quantity, item.price]
      );
      // Reduce stock
      await db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    // Clear cart
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    delete req.session.coupon;

    res.redirect(`/orders/${orderId}?new=true`);
  } catch (err) {
    res.redirect('/cart?error=' + encodeURIComponent(err.message));
  }
});

module.exports = router;
