const crypto = require('crypto');

const FLAG_SECRET = process.env.FLAG_SECRET || 'default_flag_secret_change_me';

/**
 * Generate a unique, deterministic flag for a specific user + challenge.
 * Uses HMAC-SHA256 so flags are unique per user and cannot be guessed.
 * Format: flag{sha256_first_40_chars}
 *
 * @param {number} userId
 * @param {number} challengeId
 * @param {string} challengeSlug
 * @returns {string} flag value
 */
const generateFlag = (userId, challengeId, challengeSlug) => {
  const data = `${userId}:${challengeId}:${challengeSlug}:${FLAG_SECRET}`;
  const hash = crypto.createHmac('sha256', FLAG_SECRET).update(data).digest('hex');
  return `flag{${hash.substring(0, 40)}}`;
};

/**
 * Validate a submitted flag against the expected flag.
 *
 * @param {string} submitted   - Flag submitted by user
 * @param {string} expected    - Flag generated for this user/challenge
 * @returns {boolean}
 */
const validateFlag = (submitted, expected) => {
  if (!submitted || !expected) return false;
  // Constant-time comparison to prevent timing attacks
  const submittedBuf = Buffer.from(submitted.trim());
  const expectedBuf  = Buffer.from(expected.trim());
  if (submittedBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(submittedBuf, expectedBuf);
};

/**
 * Determine rank title based on total points.
 */
const getRankTitle = (points) => {
  if (points >= 10000) return 'Elite Hacker';
  if (points >= 7500)  return 'Expert';
  if (points >= 5000)  return 'Advanced';
  if (points >= 3000)  return 'Intermediate';
  if (points >= 1500)  return 'Script Kiddie';
  if (points >= 500)   return 'Newbie';
  return 'Newbie';
};

module.exports = { generateFlag, validateFlag, getRankTitle };
