const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/dashboard ──────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Overall challenge stats
    const [[stats]] = await pool.query(`
      SELECT
        COUNT(*)                                              AS total_challenges,
        SUM(uc.status = 'solved')                            AS solved,
        SUM(uc.status = 'in_progress')                      AS in_progress,
        COALESCE(SUM(CASE WHEN uc.status='solved' THEN c.points ELSE 0 END),0) AS points_earned
      FROM challenges c
      LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ?
      WHERE c.is_active = TRUE
    `, [userId]);

    // Breakdown by category
    const [byCategory] = await pool.query(`
      SELECT c.category,
        COUNT(*)                          AS total,
        SUM(uc.status = 'solved')         AS solved
      FROM challenges c
      LEFT JOIN user_challenges uc ON c.id = uc.challenge_id AND uc.user_id = ?
      WHERE c.is_active = TRUE
      GROUP BY c.category ORDER BY total DESC
    `, [userId]);

    // Recent activity
    const [activity] = await pool.query(`
      SELECT action, details, created_at
      FROM activity_log WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 10
    `, [userId]);

    // Recently solved challenges
    const [recentSolved] = await pool.query(`
      SELECT c.title, c.category, c.difficulty, c.points, uc.solved_at
      FROM user_challenges uc
      JOIN challenges c ON c.id = uc.challenge_id
      WHERE uc.user_id = ? AND uc.status = 'solved'
      ORDER BY uc.solved_at DESC LIMIT 5
    `, [userId]);

    // Scan count
    const [[scanStats]] = await pool.query(
      'SELECT COUNT(*) AS total_scans FROM scan_results WHERE user_id = ?',
      [userId]
    );

    // User rank info
    const [userInfo] = await pool.query(
      'SELECT username, points, rank_title, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      data: {
        user: userInfo[0],
        stats: {
          ...stats,
          completion_pct: stats.total_challenges
            ? Math.round((stats.solved / stats.total_challenges) * 100) : 0,
          total_scans: scanStats.total_scans
        },
        by_category: byCategory,
        recent_activity: activity,
        recent_solved: recentSolved
      }
    });
  } catch (err) {
    console.error('[Dashboard]', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard' });
  }
});

module.exports = router;
