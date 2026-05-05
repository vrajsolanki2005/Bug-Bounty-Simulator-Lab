const challengesConfig = require('./challenges-config');
const PLATFORM_API = process.env.PLATFORM_API_URL || 'http://localhost:5000';

/**
 * Generates + submits the flag to the platform.
 * Returns { flag, label, slug } on success, or null if platform unreachable.
 */
async function submitToPlatform(platformToken, challengeSlug) {
  const config = challengesConfig[challengeSlug];
  const label = config?.label || challengeSlug;

  if (!platformToken) {
    // No token — return a static flag so the UI still works
    return { flag: `flag{${challengeSlug}_exploited}`, label, slug: challengeSlug };
  }

  try {
    const listRes = await fetch(`${PLATFORM_API}/api/challenges`, {
      headers: { Authorization: `Bearer ${platformToken}` }
    });
    if (!listRes.ok) return null;
    const { data: challenges } = await listRes.json();
    const challenge = challenges.find(c => c.slug === challengeSlug);
    if (!challenge) return null;

    const flagRes = await fetch(`${PLATFORM_API}/api/challenges/${challenge.id}/generate-flag`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${platformToken}`, 'Content-Type': 'application/json' }
    });
    if (!flagRes.ok) return null;
    const { flag } = await flagRes.json();

    // Submit to award points (fire and forget)
    fetch(`${PLATFORM_API}/api/challenges/${challenge.id}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${platformToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ flag })
    }).catch(() => {});

    return { flag, label, slug: challengeSlug, challengeId: challenge.id };
  } catch (_) {
    return null;
  }
}

module.exports = { submitToPlatform };
