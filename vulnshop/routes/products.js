const express = require('express');
const router = express.Router();
const db = require('../db');
const { submitToPlatform } = require('../platformSubmit');

// Home / product listing with search
router.get('/', async (req, res) => {
  const search = req.query.q || '';
  const category = req.query.category || '';
  const sort = req.query.sort || 'created_at';

  try {
    let products, sqlQuery;
    
    if (search) {
      // VULNERABILITY: SQL Injection in search
      // Payload: ' UNION SELECT id,flag_value,3,4,5,6,7,8,9 FROM flags-- -
      // Note: products has 9 columns: id, name, description, price, original_price, category, image_url, stock, rating
      sqlQuery = `SELECT id, name, description, price, original_price, category, image_url, stock, rating, review_count, seller FROM products WHERE (name LIKE '%${search}%' OR description LIKE '%${search}%' OR category LIKE '%${search}%')`;
      
      console.log('[DEBUG] Search query:', sqlQuery); // Debug logging vulnerability
      
      try {
        [products] = await db.query(sqlQuery);
        // Flags auto-detected by middleware
      } catch (sqlErr) {
        // VULNERABILITY: Raw SQL error exposed
        return res.render('products/index', {
          user: req.session.user || null,
          title: 'Search Results',
          products: [],
          search,
          category,
          categories: [],
          error: `Query error: ${sqlErr.message}`,
          sqlQuery,
          capturedFlag: null
        });
      }
    } else if (category) {
      [products] = await db.query(
        'SELECT * FROM products WHERE category = ? ORDER BY created_at DESC',
        [category]
      );
    } else {
      [products] = await db.query('SELECT * FROM products ORDER BY created_at DESC LIMIT 30');
    }

    const [categories] = await db.query('SELECT DISTINCT category FROM products ORDER BY category');

    // VULNERABILITY: search term reflected back unescaped (Reflected XSS)
    // Payload: <script>alert(document.cookie)</script>
    // Payload: <img src=x onerror="fetch('/api/steal?c='+document.cookie)">
    res.render('products/index', {
      user: req.session.user || null,
      title: search ? `Results for "${search}"` : 'Shop All Products',
      products,
      search,
      category,
      categories,
      error: null,
      sqlQuery: search ? sqlQuery : null,
      capturedFlag: req.session.capturedFlag || null
    });
    req.session.capturedFlag = null;
  } catch (err) {
    res.render('products/index', {
      user: req.session.user || null,
      title: 'Products',
      products: [],
      search,
      category,
      categories: [],
      error: err.message,
      sqlQuery: null,
      capturedFlag: null
    });
  }
});

// Product detail page
router.get('/:id', async (req, res) => {
  const productId = req.params.id;
  
  try {
    // VULNERABILITY: No parameterized query for product ID
    const [products] = await db.query(`SELECT * FROM products WHERE id=${productId}`);
    
    if (products.length === 0) {
      return res.status(404).render('error', {
        user: req.session.user || null,
        title: 'Product Not Found',
        message: 'The product you are looking for does not exist.',
        hint: null,
        code: 404
      });
    }

    const product = products[0];

    // Get reviews - rendered unescaped (stored XSS delivery point)
    const [reviews] = await db.query(
      'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [productId]
    );

    // Related products
    const [related] = await db.query(
      'SELECT * FROM products WHERE category = ? AND id != ? LIMIT 4',
      [product.category, productId]
    );

    res.render('products/show', {
      user: req.session.user || null,
      title: product.name,
      product,
      reviews, // Reviews passed to template with unescaped rendering (stored XSS)
      related
    });
  } catch (err) {
    res.status(500).render('error', {
      user: req.session.user || null,
      title: 'Error',
      message: `Error loading product: ${err.message}`, // Detailed error (vulnerability)
      hint: null,
      code: 500
    });
  }
});

// Submit review - stored XSS vulnerability
router.post('/:id/review', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const productId = req.params.id;
  // VULNERABILITY: Review content not sanitized before storage (Stored XSS)
  // Payload: <script>document.location='/api/steal?c='+document.cookie</script>
  // Payload: <img src=x onerror="alert('XSS: '+document.cookie)">
  const { rating, title, content } = req.body;

  try {
    await db.query(
      'INSERT INTO reviews (product_id, user_id, username, rating, title, content) VALUES (?, ?, ?, ?, ?, ?)',
      [productId, req.session.user.id, req.session.user.username, rating, title, content]
    );

    // Update product rating
    await db.query(`
      UPDATE products SET 
        rating = (SELECT AVG(rating) FROM reviews WHERE product_id = ?),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = ?)
      WHERE id = ?
    `, [productId, productId, productId]);

    res.redirect(`/products/${productId}?reviewPosted=true`);
    // Flag auto-detected by middleware
  } catch (err) {
    res.redirect(`/products/${productId}?error=${encodeURIComponent(err.message)}`);
  }
});

module.exports = router;
