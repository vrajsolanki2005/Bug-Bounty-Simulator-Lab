const { submitToPlatform } = require('./platformSubmit');
const challengesConfig = require('./challenges-config');

/**
 * Universal Flag Detection Middleware
 * Automatically detects when a vulnerability is exploited and generates a flag
 */
async function detectAndFlagExploit(req, res, next) {
  // Skip if no platform token (standalone mode)
  if (!req.session.platformToken) return next();

  // Check each challenge configuration
  for (const [slug, config] of Object.entries(challengesConfig)) {
    try {
      // Run the detection function for this challenge
      if (config.detection && config.detection(req, req.session)) {
        console.log(`[FLAG] Detected exploit: ${slug}`);
        
        // Generate and submit flag
        const result = await submitToPlatform(req.session.platformToken, slug);
        
        if (result) {
          // Store in session for modal display
          req.session.capturedFlag = result;
          console.log(`[FLAG] Generated flag for ${slug}: ${result.flag}`);
        }
        
        // Only trigger once per request
        break;
      }
    } catch (err) {
      console.error(`[FLAG] Detection error for ${slug}:`, err.message);
    }
  }
  
  next();
}

/**
 * Manual flag trigger for challenges that can't be auto-detected
 */
async function triggerFlag(req, challengeSlug) {
  if (!req.session.platformToken) return null;
  
  const result = await submitToPlatform(req.session.platformToken, challengeSlug);
  if (result) {
    req.session.capturedFlag = result;
  }
  return result;
}

module.exports = { detectAndFlagExploit, triggerFlag };
