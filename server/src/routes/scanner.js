const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { runNmapScan, SCAN_PROFILES } = require('../services/nmapService');

const router = express.Router();

// Rate limit scans: max 5 per 10 minutes per user
const scanLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5, keyGenerator: (req) => `scan_${req.user?.id}` });

// ── POST /api/scanner/scan ──────────────────────────────────────────
router.post('/scan', authenticate, scanLimiter,
  [
    body('target').notEmpty().trim(),
    body('scan_type').optional().isIn(['quick', 'full', 'stealth', 'version', 'vuln'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { target, scan_type = 'quick' } = req.body;
    const io = req.app.get('io');

    try {
      // Create scan record
      const [result] = await pool.query(
        'INSERT INTO scan_results (user_id, target, scan_type, status) VALUES (?,?,?,?)',
        [req.user.id, target, scan_type, 'running']
      );
      const scanId = result.insertId;

      // Respond immediately with scan ID
      res.json({ success: true, scan_id: scanId, message: 'Scan started. Connect to socket for live output.' });

      // Run scan asynchronously, stream via socket
      const roomId = `scan_${req.user.id}_${scanId}`;
      const onData = (line) => io.to(roomId).emit('scan_output', { line, scan_id: scanId });

      runNmapScan(target, scan_type, onData)
        .then(async (results) => {
          await pool.query(
            'UPDATE scan_results SET status=?, results=?, completed_at=NOW() WHERE id=?',
            ['completed', JSON.stringify(results), scanId]
          );
          io.to(roomId).emit('scan_complete', { scan_id: scanId, results });
        })
        .catch(async (err) => {
          await pool.query('UPDATE scan_results SET status=? WHERE id=?', ['failed', scanId]);
          io.to(roomId).emit('scan_error', { scan_id: scanId, error: err.message });
        });

    } catch (err) {
      console.error('[Scanner/Scan]', err);
      res.status(500).json({ success: false, message: err.message || 'Scan failed' });
    }
  }
);

// ── GET /api/scanner/history ────────────────────────────────────────
router.get('/history', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, target, scan_type, status, results, started_at, completed_at
      FROM scan_results WHERE user_id = ?
      ORDER BY started_at DESC LIMIT 20
    `, [req.user.id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

// ── GET /api/scanner/:id ────────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM scan_results WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: 'Scan not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch scan' });
  }
});

// ── GET /api/scanner/profiles ───────────────────────────────────────
router.get('/meta/profiles', authenticate, (req, res) => {
  const profiles = Object.entries(SCAN_PROFILES).map(([key, val]) => ({
    key, label: val.label, flags: val.flags.join(' ')
  }));
  res.json({ success: true, data: profiles });
});

module.exports = router;
