const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const pool = require('../config/database');
const { generateTokens } = require('../middleware/auth');
const { getRankTitle } = require('../services/flagService');

const router = express.Router();

// Strict rate limit on auth routes
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

// ── POST /api/auth/register ─────────────────────────────────────────
router.post('/register',
  authLimiter,
  [
    body('username').trim().isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password } = req.body;
    try {
      // Check duplicates
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE username = ? OR email = ?', [username, email]
      );
      if (existing.length) {
        return res.status(409).json({ success: false, message: 'Username or email already exists' });
      }

      const hash = await bcrypt.hash(password, 12);
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, hash]
      );

      const user = { id: result.insertId, username, email, role: 'user', points: 0, rank_title: 'Newbie' };
      const { accessToken, refreshToken } = generateTokens(user);

      res.status(201).json({ success: true, message: 'Account created successfully', accessToken, refreshToken, user });
    } catch (err) {
      console.error('[Auth/Register]', err);
      res.status(500).json({ success: false, message: 'Registration failed' });
    }
  }
);

// ── POST /api/auth/login ────────────────────────────────────────────
router.post('/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (!rows.length) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const { accessToken, refreshToken } = generateTokens(user);
      const { password_hash, ...safeUser } = user;

      res.json({ success: true, message: 'Login successful', accessToken, refreshToken, user: safeUser });
    } catch (err) {
      console.error('[Auth/Login]', err);
      res.status(500).json({ success: false, message: 'Login failed' });
    }
  }
);

// ── GET /api/auth/me ────────────────────────────────────────────────
const { authenticate } = require('../middleware/auth');
router.get('/me', authenticate, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// ── POST /api/auth/refresh ──────────────────────────────────────────
const jwt = require('jsonwebtoken');
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'User not found' });
    const { accessToken, refreshToken: newRefresh } = generateTokens(rows[0]);
    res.json({ success: true, accessToken, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

module.exports = router;
