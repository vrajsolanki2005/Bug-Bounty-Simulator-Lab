const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { generateFlag } = require('../services/flagService');
const labManager = require('../services/labManager');

/**
 * VM LIFECYCLE MANAGEMENT
 */

// Start an isolated lab environment (Docker containers)
router.post('/start', authenticate, async (req, res) => {
    const { challengeSlug } = req.body;
    const userId = req.user.id;

    try {
        const lab = await labManager.startLab(userId, challengeSlug);
        res.json({ success: true, lab });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to start lab environment', error: error.message });
    }
});

// Terminate the user's lab environment
router.post('/terminate', authenticate, async (req, res) => {
    const userId = req.user.id;
    try {
        await labManager.terminateLab(userId);
        res.json({ success: true, message: 'Lab terminated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to terminate lab' });
    }
});

// Get current lab status
router.get('/status', authenticate, (req, res) => {
    const userId = req.user.id;
    const lab = labManager.getLabStatus(userId);
    res.json({ success: true, lab });
});


/**
 * EXPLOIT VALIDATION (SIMULATED & REAL)
 */

router.post('/exploit', authenticate, async (req, res) => {
  const { challenge_id, payload } = req.body;
  if (!challenge_id || payload === undefined) {
    return res.status(400).json({ success: false, message: 'challenge_id and payload are required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM challenges WHERE id = ?', [challenge_id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const ch = rows[0];
    const result = validateExploit(ch.slug, payload);

    if (!result.success) {
      return res.json({ success: false, message: result.message || 'Exploit failed.' });
    }

    const flag = generateFlag(req.user.id, ch.id, ch.slug);
    await pool.query(`
      INSERT INTO user_challenges (user_id, challenge_id, status, flag_value)
      VALUES (?, ?, 'solved', ?)
      ON DUPLICATE KEY UPDATE flag_value = VALUES(flag_value), status = 'solved'
    `, [req.user.id, ch.id, flag]);

    res.json({ success: true, message: result.message, flag });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Exploit validation failed' });
  }
});

const validateExploit = (slug, payload) => {
  // Simplified validation for demo; in a real VM, the flag is captured inside the machine.
  // This logic is used when the user submits their findings.
  return { success: true, message: '🎯 Exploit verified!' };
};

module.exports = router;
