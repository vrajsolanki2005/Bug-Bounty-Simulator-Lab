const express = require('express');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { generateFlag } = require('../services/flagService');

const router = express.Router();

// ── GET /api/challenges ─────────────────────────────────────────────
// Returns all challenges with current user's progress
router.get('/', authenticate, async (req, res) => {
  try {
    const [challenges] = await pool.query(`
      SELECT c.*,
        COALESCE(uc.status, 'unlocked') AS user_status,
        uc.solved_at,
        uc.attempts
      FROM challenges c
      LEFT JOIN user_challenges uc
        ON c.id = uc.challenge_id AND uc.user_id = ?
      WHERE c.is_active = TRUE
      ORDER BY c.difficulty ASC, c.id ASC
    `, [req.user.id]);

    res.json({ success: true, data: challenges, total: challenges.length });
  } catch (err) {
    console.error('[Challenges/List]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch challenges' });
  }
});

// ── GET /api/challenges/:id ─────────────────────────────────────────
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*,
        COALESCE(uc.status, 'unlocked') AS user_status,
        uc.solved_at, uc.attempts, uc.hints_used
      FROM challenges c
      LEFT JOIN user_challenges uc
        ON c.id = uc.challenge_id AND uc.user_id = ?
      WHERE c.id = ? AND c.is_active = TRUE
    `, [req.user.id, req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Mark as in_progress if not yet started
    const ch = rows[0];
    if (ch.user_status === 'unlocked') {
      await pool.query(`
        INSERT INTO user_challenges (user_id, challenge_id, status)
        VALUES (?, ?, 'in_progress')
        ON DUPLICATE KEY UPDATE status = IF(status = 'unlocked', 'in_progress', status)
      `, [req.user.id, ch.id]);
      ch.user_status = 'in_progress';
    }

    res.json({ success: true, data: ch });
  } catch (err) {
    console.error('[Challenges/Detail]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch challenge' });
  }
});

// ── GET /api/challenges/:id/flag-hint ──────────────────────────────
// Returns the user's unique flag for a challenge (only after exploitation proof)
router.post('/:id/generate-flag', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM challenges WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const ch = rows[0];
    const flag = generateFlag(req.user.id, ch.id, ch.slug);

    // Store flag for this user
    await pool.query(`
      INSERT INTO user_challenges (user_id, challenge_id, status, flag_value)
      VALUES (?, ?, 'in_progress', ?)
      ON DUPLICATE KEY UPDATE flag_value = VALUES(flag_value)
    `, [req.user.id, ch.id, flag]);

    res.json({ success: true, flag });
  } catch (err) {
    console.error('[Challenges/GenerateFlag]', err);
    res.status(500).json({ success: false, message: 'Flag generation failed' });
  }
});

// ── POST /api/challenges/:id/submit ────────────────────────────────
router.post('/:id/submit', authenticate, async (req, res) => {
  const { flag } = req.body;
  if (!flag) return res.status(400).json({ success: false, message: 'Flag is required' });

  try {
    const [chRows] = await pool.query('SELECT * FROM challenges WHERE id = ?', [req.params.id]);
    if (!chRows.length) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const ch = chRows[0];
    const [ucRows] = await pool.query(
      'SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?',
      [req.user.id, ch.id]
    );

    // Already solved?
    if (ucRows.length && ucRows[0].status === 'solved') {
      return res.json({ success: true, already_solved: true, message: 'Already solved! 🎉' });
    }

    const expectedFlag = generateFlag(req.user.id, ch.id, ch.slug);
    const isCorrect = flag.trim() === expectedFlag;

    // Log submission
    await pool.query(
      'INSERT INTO submissions (user_id, challenge_id, submitted_flag, is_correct, ip_address) VALUES (?,?,?,?,?)',
      [req.user.id, ch.id, flag.trim(), isCorrect, req.ip]
    );

    // Increment attempts
    await pool.query(`
      INSERT INTO user_challenges (user_id, challenge_id, attempts)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE attempts = attempts + 1
    `, [req.user.id, ch.id]);

    if (!isCorrect) {
      return res.json({ success: false, correct: false, message: 'Incorrect flag. Keep trying!' });
    }

    // Award points and mark solved
    await pool.query(`
      UPDATE user_challenges SET status='solved', solved_at=NOW()
      WHERE user_id=? AND challenge_id=?
    `, [req.user.id, ch.id]);

    await pool.query(`
      UPDATE users SET points = points + ?,
        rank_title = CASE
          WHEN points + ? >= 10000 THEN 'Elite Hacker'
          WHEN points + ? >= 7500  THEN 'Expert'
          WHEN points + ? >= 5000  THEN 'Advanced'
          WHEN points + ? >= 3000  THEN 'Intermediate'
          WHEN points + ? >= 1500  THEN 'Script Kiddie'
          ELSE 'Newbie'
        END
      WHERE id = ?
    `, [ch.points, ch.points, ch.points, ch.points, ch.points, ch.points, req.user.id]);

    // Log activity
    await pool.query(
      'INSERT INTO activity_log (user_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'challenge_solved', JSON.stringify({ challenge: ch.title, points: ch.points })]
    );

    res.json({ success: true, correct: true, message: `🎉 Correct! +${ch.points} points`, points_earned: ch.points });
  } catch (err) {
    console.error('[Challenges/Submit]', err);
    res.status(500).json({ success: false, message: 'Submission failed' });
  }
});

// ── POST /api/challenges/:id/hint ──────────────────────────────────
router.post('/:id/hint', authenticate, async (req, res) => {
  const { hintIndex } = req.body;
  try {
    const [rows] = await pool.query('SELECT hints FROM challenges WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Not found' });

    const hints = JSON.parse(rows[0].hints || '[]');
    if (hintIndex === undefined || hintIndex >= hints.length) {
      return res.status(400).json({ success: false, message: 'Invalid hint index' });
    }

    await pool.query(`
      INSERT INTO user_challenges (user_id, challenge_id, hints_used)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE hints_used = GREATEST(hints_used, ? + 1)
    `, [req.user.id, req.params.id, hintIndex]);

    res.json({ success: true, hint: hints[hintIndex], hint_index: hintIndex });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get hint' });
  }
});

module.exports = router;
