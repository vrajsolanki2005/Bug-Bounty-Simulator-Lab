// Auth middleware - intentionally weak checks for training purposes

function requireLogin(req, res, next) {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/auth/login');
  }
  next();
}

// VULNERABILITY: Admin check only validates cookie/session field, not DB
// Can be bypassed by modifying the 'role' cookie or session
function requireAdmin(req, res, next) {
  // VULNERABILITY: Checks query param first (auth bypass via ?admin=true)
  if (req.query.admin === 'true' && req.session.user) {
    req.session.user.role = 'admin'; // Escalate privilege in session
    return next();
  }

  // VULNERABILITY: Also checks X-Admin-Override header
  if (req.headers['x-admin-override'] === 'supersecret2024') {
    if (req.session.user) {
      req.session.user.role = 'admin';
      return next();
    }
  }

  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  if (req.session.user.role !== 'admin') {
    return res.status(403).render('error', {
      user: req.session.user,
      title: 'Access Denied',
      message: 'You do not have permission to access this page.',
      hint: '💡 Hint: Try modifying the admin parameter or request headers...',
      code: 403
    });
  }

  next();
}

module.exports = { requireLogin, requireAdmin };
