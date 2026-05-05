require('dotenv').config();
const express      = require('express');
const session      = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const path         = require('path');
const { detectAndFlagExploit } = require('./flagDetection');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// VULNERABILITY: weak session (no secure/sameSite/httpOnly)
app.use(session({
  secret           : process.env.SESSION_SECRET || 'vulnshop-super-secret-key-2024',
  resave           : true,
  saveUninitialized: true,
  cookie: {
    maxAge  : 24 * 60 * 60 * 1000,
    httpOnly: false,   // VULN: JS can read cookie → XSS theft
    secure  : false,   // VULN: works over plain HTTP
    sameSite: false    // VULN: CSRF possible
  },
  name: 'vulnshop.sid'
}));

// VULNERABILITY: permissive CORS + no security headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  // Missing: X-Frame-Options, CSP, X-Content-Type-Options  ← intentional
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Universal Flag Detection Middleware
app.use(detectAndFlagExploit);

// ── Routes ───────────────────────────────────────────────────
app.use('/auth',     require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/cart',     require('./routes/cart'));
app.use('/orders',   require('./routes/orders'));
app.use('/profile',  require('./routes/profile'));
app.use('/admin',    require('./routes/admin'));
app.use('/api',      require('./routes/api'));
app.get('/', (req, res) => res.redirect('/products'));

// Store platform JWT token from iframe URL param into session
app.get('/init', (req, res) => {
  if (req.query.token) {
    req.session.platformToken = req.query.token;
  }
  res.redirect('/');
});

// VULNERABILITY: debug endpoint exposes full session + cookies
app.get('/debug', (req, res) => {
  res.json({
    session: req.session,
    cookies: req.cookies,
    headers: req.headers,
    note   : '⚠️  Debug endpoint — should be removed in production!'
  });
});

// ── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', {
    user   : req.session.user || null,
    title  : 'Page Not Found',
    message: `The page "${req.path}" was not found.`,
    hint   : null,
    code   : 404
  });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    user   : req.session.user || null,
    title  : 'Server Error',
    message: err.message,   // VULN: stack trace exposed
    hint   : null,
    code   : 500
  });
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║            🛒  VulnShop  —  Security Training App       ║
╠══════════════════════════════════════════════════════════╣
║  Shop     →  http://localhost:${PORT}                      ║
║  Admin    →  http://localhost:${PORT}/admin                ║
║  Challenges→ http://localhost:${PORT}/api/challenges       ║
║  Debug    →  http://localhost:${PORT}/debug                ║
╠══════════════════════════════════════════════════════════╣
║  Admin:  admin / admin123                                ║
║  User:   john_doe / password123                          ║
╠══════════════════════════════════════════════════════════╣
║  ⚠️  Contains intentional vulnerabilities — training only║
╚══════════════════════════════════════════════════════════╝
`);
});

module.exports = app;
