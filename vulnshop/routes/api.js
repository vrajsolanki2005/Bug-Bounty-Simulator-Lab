const express = require('express');
const router = express.Router();
const db = require('../db');

// Cookie stealer endpoint (receives stolen cookies from XSS payloads)
// In training: shows what an attacker's server would receive
router.get('/steal', (req, res) => {
  const stolen = req.query.c || req.query.cookie || req.query.data || 'No data received';
  console.log('[XSS] Cookie stolen:', stolen, '| IP:', req.ip);
  
  // Show the flag when XSS successfully exfiltrates data
  res.json({
    status: 'success',
    message: '🎯 XSS Cookie Theft Successful!',
    stolen_data: stolen,
    flag: 'flag{r3fl3ct3d_xss_c00k13_st34l_2024}',
    note: 'This endpoint simulates an attacker-controlled server that receives stolen session cookies.'
  });
});

// Stored XSS flag endpoint - triggered when stored XSS payload fires
router.get('/xss-flag', (req, res) => {
  const source = req.query.src || 'unknown';
  console.log('[STORED XSS] Payload fired from:', source, '| IP:', req.ip);
  
  res.json({
    status: 'pwned',
    message: '🎯 Stored XSS Successfully Executed!',
    flag: 'flag{st0r3d_xss_p3rs1st3nt_4tt4ck_2024}',
    source,
    note: 'Your malicious review executed JavaScript in the context of other users.'
  });
});

// Track XSS beacon (img src based XSS tracking)
router.get('/track', (req, res) => {
  const cookie = req.query.cookie || req.query.c || '';
  const page = req.query.page || 'unknown';
  console.log('[XSS BEACON] Cookie received:', cookie, '| Page:', page, '| IP:', req.ip);
  
  // Return a 1x1 transparent GIF
  const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('X-Stolen-Cookie', cookie);
  res.setHeader('X-XSS-Flag', 'flag{st0r3d_xss_p3rs1st3nt_4tt4ck_2024}');
  res.send(pixel);
});

// Challenges overview
router.get('/challenges', (req, res) => {
  const challenges = [
    {
      id: 1,
      name: 'SQL Injection - Login Bypass',
      endpoint: 'POST /auth/login',
      difficulty: 'Easy',
      hint: "Try username: admin'-- with any password",
      flag_format: 'flag{sql_1nj3ct10n_...}'
    },
    {
      id: 2,
      name: 'SQL Injection - Data Exfiltration',
      endpoint: 'GET /products?q=',
      difficulty: 'Medium',
      hint: "Search with a UNION SELECT payload to dump the flags table",
      flag_format: 'flag{un10n_b4s3d_...}'
    },
    {
      id: 3,
      name: 'Reflected XSS',
      endpoint: 'GET /products?q=',
      difficulty: 'Easy',
      hint: "Inject <script> tags into the search parameter",
      flag_format: 'flag{r3fl3ct3d_xss_...}'
    },
    {
      id: 4,
      name: 'Stored XSS',
      endpoint: 'POST /products/:id/review',
      difficulty: 'Medium',
      hint: "Submit a review with a script payload. Access /api/steal or /api/xss-flag",
      flag_format: 'flag{st0r3d_xss_...}'
    },
    {
      id: 5,
      name: 'IDOR - Order Access',
      endpoint: 'GET /orders/:id',
      difficulty: 'Easy',
      hint: "Access order #1 while logged in as a regular user",
      flag_format: 'flag{1d0r_...}'
    },
    {
      id: 6,
      name: 'Admin Panel Bypass',
      endpoint: 'GET /admin',
      difficulty: 'Medium',
      hint: "Try adding ?admin=true to the URL or use the X-Admin-Override header",
      flag_format: 'flag{4dm1n_byp4ss_...}'
    },
    {
      id: 7,
      name: 'Privilege Escalation (Mass Assignment)',
      endpoint: 'POST /auth/register',
      difficulty: 'Medium',
      hint: "Add role=admin to the registration POST body",
      flag_format: 'flag{m4ss_4ss1gnm3nt_...}'
    },
    {
      id: 8,
      name: 'CSRF - Password Change',
      endpoint: 'POST /profile/password',
      difficulty: 'Hard',
      hint: "The password change form has no CSRF token. Craft an auto-submitting form.",
      flag_format: 'flag{csrf_...}'
    },
    {
      id: 9,
      name: 'File Upload Bypass',
      endpoint: 'POST /profile/avatar',
      difficulty: 'Medium',
      hint: "Upload a .html or .js file instead of an image",
      flag_format: 'flag{f1l3_upl04d_...}'
    },
    {
      id: 10,
      name: 'Business Logic Flaw',
      endpoint: 'POST /cart/coupon',
      difficulty: 'Easy',
      hint: "Apply coupon code FLASH50 for 50% off. Notice the business logic issue.",
      flag_format: 'flag{bus1n3ss_l0g1c_...}'
    }
  ];
  
  res.json({ 
    app: 'VulnShop Security Training',
    version: '1.0.0',
    total_challenges: challenges.length,
    challenges 
  });
});

// Health check with version info (information disclosure)
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'VulnShop',
    version: '1.0.0',
    db: 'MySQL 8.0',
    framework: 'Express 4.18',
    node: process.version,
    warnings: [
      'This application contains intentional security vulnerabilities',
      'For cybersecurity training use only',
      'Do not deploy in production'
    ]
  });
});

module.exports = router;
