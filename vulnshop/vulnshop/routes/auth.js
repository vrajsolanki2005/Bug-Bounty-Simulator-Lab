const express = require('express');
const router = express.Router();
const db = require('../db');
const { submitToPlatform } = require('../platformSubmit');

// Login page
router.get('/login', (req, res) => {
  const capturedFlag = req.session.capturedFlag || null;
  req.session.capturedFlag = null;
  res.render('auth/login', {
    user: req.session.user || null,
    title: 'Sign In',
    error: req.query.error || null,
    success: req.query.success || null,
    capturedFlag
  });
});

// VULNERABILITY: SQL Injection in login
// Payload: username = admin'-- (bypasses password check)
// Payload: username = ' OR '1'='1'-- (logs in as first user)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render('auth/login', {
      user: null,
      title: 'Sign In',
      error: 'Please enter both username and password.',
      success: null
    });
  }

  try {
    // VULNERABILITY: Direct string concatenation - SQL Injection possible
    const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
    
    console.log('[DEBUG] Login query:', query); // Logging vulnerability
    
    const [rows] = await db.query(query);

    if (rows.length > 0) {
      const user = rows[0];
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        avatar: user.avatar
      };

      // Show flag if admin logged in (especially via SQLi bypass)
      if (user.role === 'admin') {
        // Flag auto-detected by middleware
      }

      const returnTo = req.session.returnTo || '/';
      delete req.session.returnTo;
      res.redirect(returnTo);
    } else {
      res.render('auth/login', {
        user: null,
        title: 'Sign In',
        error: 'Invalid username or password.',
        success: null
      });
    }
  } catch (err) {
    // VULNERABILITY: Detailed error messages exposed to user
    res.render('auth/login', {
      user: null,
      title: 'Sign In',
      error: `Database error: ${err.message}`,
      success: null
    });
  }
});

// Register page
router.get('/register', (req, res) => {
  res.render('auth/register', {
    user: req.session.user || null,
    title: 'Create Account',
    error: null
  });
});

// VULNERABILITY: Mass Assignment / Privilege Escalation
// Attacker can send role=admin in POST body
router.post('/register', async (req, res) => {
  const { username, email, password, full_name, phone, address } = req.body;
  
  // VULNERABILITY: Role taken from user input without validation
  const role = req.body.role || 'user'; // Mass assignment vulnerability

  if (!username || !email || !password) {
    return res.render('auth/register', {
      user: null,
      title: 'Create Account',
      error: 'Please fill in all required fields.'
    });
  }

  // Weak password requirements
  if (password.length < 4) {
    return res.render('auth/register', {
      user: null,
      title: 'Create Account',
      error: 'Password must be at least 4 characters.'
    });
  }

  try {
    // Check if username exists (using string interpolation - another SQLi point)
    const [existing] = await db.query(`SELECT id FROM users WHERE username='${username}' OR email='${email}'`);
    
    if (existing.length > 0) {
      return res.render('auth/register', {
        user: null,
        title: 'Create Account',
        error: 'Username or email already exists.'
      });
    }

    // VULNERABILITY: Password stored in plaintext
    // VULNERABILITY: Role from user input directly inserted
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, role, full_name, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, password, role, full_name || username, phone || null, address || null]
    );

    let successMsg = `?success=Account created! Welcome, ${username}!`;
    
    // Show flag if user registered as admin (mass assignment)
    if (role === 'admin') {
      // Flag auto-detected by middleware
      successMsg = '?success=Account created! You registered with elevated privileges...';
    }

    res.redirect('/auth/login' + successMsg);
  } catch (err) {
    res.render('auth/register', {
      user: null,
      title: 'Create Account',
      error: `Error creating account: ${err.message}`
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
