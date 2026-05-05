const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireLogin } = require('../middleware/auth');
const { submitToPlatform } = require('../platformSubmit');

// VULNERABILITY: File upload with no type validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // VULNERABILITY: Preserves original file extension - allows .html, .js, .php uploads
    // VULNERABILITY: Predictable filename using timestamp
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.session.user.id}_${Date.now()}${ext}`);
  }
});

// VULNERABILITY: No file type filtering at all
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Only size limit, no type check
});

// Profile page
router.get('/', requireLogin, async (req, res) => {
  const userId = req.session.user.id;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    const user = users[0];

    const [orders] = await db.query(
      'SELECT COUNT(*) as count, SUM(total) as total_spent FROM orders WHERE user_id = ?',
      [userId]
    );

    res.render('profile/index', {
      user: req.session.user,
      title: 'Your Account',
      profile: user,
      stats: orders[0],
      success: req.query.success || null,
      error: req.query.error || null,
      capturedFlag: req.session.capturedFlag || null,
      csrfFlag: req.session.csrfFlag || null,
      privEscFlag: req.session.privEscFlag || null,
      fileUploadFlag: req.session.fileUploadFlag || null
    });
    req.session.capturedFlag = null;
  } catch (err) {
    res.render('profile/index', {
      user: req.session.user,
      title: 'Your Account',
      profile: req.session.user,
      stats: { count: 0, total_spent: 0 },
      success: null,
      error: err.message,
      capturedFlag: null,
      csrfFlag: null,
      privEscFlag: null,
      fileUploadFlag: null
    });
  }
});

// Update profile
router.post('/update', requireLogin, async (req, res) => {
  const userId = req.session.user.id;
  const { full_name, phone, address } = req.body;

  try {
    await db.query(
      'UPDATE users SET full_name = ?, phone = ?, address = ? WHERE id = ?',
      [full_name, phone, address, userId]
    );

    req.session.user.full_name = full_name;
    res.redirect('/profile?success=Profile+updated+successfully');
  } catch (err) {
    res.redirect('/profile?error=' + encodeURIComponent(err.message));
  }
});

// VULNERABILITY: Password change with NO CSRF token
// Attacker can craft a page that automatically submits this form
// CSRF PoC: <form action="http://localhost:3000/profile/password" method="POST">
//              <input name="new_password" value="hacked123">
//              <input name="confirm_password" value="hacked123">
//           </form>
//           <script>document.forms[0].submit()</script>
router.post('/password', requireLogin, async (req, res) => {
  const userId = req.session.user.id;
  const { current_password, new_password, confirm_password } = req.body;

  // VULNERABILITY: No CSRF token validation at all
  // Note: There's intentionally no req.session.csrfToken check

  try {
    // Get current password
    const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
    
    // VULNERABILITY: Weak current password check (can be bypassed if current_password is optional in some flows)
    if (current_password && users[0].password !== current_password) {
      return res.redirect('/profile?error=Current+password+is+incorrect');
    }

    if (new_password !== confirm_password) {
      return res.redirect('/profile?error=Passwords+do+not+match');
    }

    if (!new_password || new_password.length < 4) {
      return res.redirect('/profile?error=Password+too+short');
    }

    // VULNERABILITY: Store new password in plaintext
    await db.query('UPDATE users SET password = ? WHERE id = ?', [new_password, userId]);

    // Set CSRF flag to show it was exploited
    req.session.csrfFlag = 'flag{csrf_n0_t0k3n_p4ssw0rd_ch4ng3_2024}';
    // Flag auto-detected by middleware

    res.redirect('/profile?success=Password+changed+successfully');
  } catch (err) {
    res.redirect('/profile?error=' + encodeURIComponent(err.message));
  }
});

// VULNERABILITY: File upload - no type validation
// Upload a .html file with JS payload, then access /uploads/avatar_X_Y.html
// The uploaded file is accessible and executed by the browser
router.post('/avatar', requireLogin, upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.redirect('/profile?error=No+file+uploaded');
  }

  const filePath = `/uploads/${req.file.filename}`;
  const ext = path.extname(req.file.originalname).toLowerCase();

  try {
    await db.query('UPDATE users SET avatar = ? WHERE id = ?', [filePath, req.session.user.id]);
    req.session.user.avatar = filePath;

    // VULNERABILITY: Dangerous file types trigger flag reveal
    const dangerousExtensions = ['.html', '.htm', '.js', '.php', '.jsp', '.asp', '.aspx', '.svg'];
    if (dangerousExtensions.includes(ext)) {
      req.session.fileUploadFlag = 'flag{f1l3_upl04d_n0_v4l1d4t10n_2024}';
      // Flag auto-detected by middleware
      return res.redirect(`/profile?success=File+uploaded+to+${filePath}+⚠️+Non-image+file+detected!&fileFlag=true`);
    }

    res.redirect('/profile?success=Profile+picture+updated');
  } catch (err) {
    res.redirect('/profile?error=' + encodeURIComponent(err.message));
  }
});

// VULNERABILITY: Path traversal in download endpoint
// Payload: /profile/download?file=../../etc/passwd
router.get('/download', requireLogin, (req, res) => {
  const filename = req.query.file;
  if (!filename) {
    return res.json({ error: 'No file specified' });
  }

  // VULNERABILITY: Direct path join without sanitization
  const filePath = path.join(__dirname, '../public/uploads', filename);

  // Check if file exists and send it
  if (fs.existsSync(filePath)) {
    // VULNERABILITY: Path traversal flag if accessing outside uploads dir
    const uploadsDir = path.join(__dirname, '../public/uploads');
    if (!filePath.startsWith(uploadsDir)) {
      res.setHeader('X-Path-Traversal-Flag', 'flag{p4th_tr4v3rs4l_d1r_l1st1ng_2024}');
      res.setHeader('X-Challenge', 'Congratulations! You found the path traversal vulnerability!');
      // Flag auto-detected by middleware
    }
    res.sendFile(filePath);
  } else {
    // Expose file system information (vulnerability)
    res.json({ 
      error: 'File not found',
      attempted_path: filePath, // Information disclosure
      uploads_dir: __dirname + '/../public/uploads/'
    });
  }
});

module.exports = router;
