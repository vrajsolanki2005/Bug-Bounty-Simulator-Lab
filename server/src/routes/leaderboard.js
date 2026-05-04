const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/leaderboard ────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const [leaderboard] = await pool.query(`
      SELECT
        u.id, u.username, u.points, u.rank_title,
        COUNT(CASE WHEN uc.status='solved' THEN 1 END) AS solved_count,
        MAX(uc.solved_at) AS last_solve
      FROM users u
      LEFT JOIN user_challenges uc ON u.id = uc.user_id
      WHERE u.role = 'user'
      GROUP BY u.id
      ORDER BY u.points DESC, solved_count DESC, last_solve ASC
      LIMIT 50
    `);

    // Add rank position
    const ranked = leaderboard.map((row, idx) => ({ ...row, rank: idx + 1 }));

    res.json({ success: true, data: ranked });
  } catch (err) {
    console.error('[Leaderboard]', err);
    res.status(500).json({ success: false, message: 'Failed to load leaderboard' });
  }
});

module.exports = router;
