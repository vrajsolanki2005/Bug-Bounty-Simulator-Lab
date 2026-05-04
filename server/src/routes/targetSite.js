const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const flagService = require('../services/flagService');
const db = require('../config/database');

/**
 * UNIFIED VULNERABLE APPLICATION (Target Site)
 * This router implements a single cohesive application with multiple flaws.
 */

// 1. SQL Injection - Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    // INTENTIONALLY VULNERABLE QUERY
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    const [rows] = await db.query(query);

    if (rows.length > 0) {
      // If they bypassed with SQLi (e.g. admin' --)
      const user = rows[0];
      let flag = null;
      
      // If they logged in as admin using SQLi
      if (username.includes("'") || username.includes("--")) {
        flag = flagService.generateFlag(req.user?.id || 0, 'sqli-bypass');
      }

      return res.json({ 
        success: true, 
        message: `Logged in as ${user.username}`, 
        user: { id: user.id, username: user.username },
        flag: flag // Show flag if exploit used
      });
    }
    
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    // If SQL error occurs, return it (leaks info, also a flaw)
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Reflected XSS - Search
router.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) return res.json({ results: [] });

  let flag = null;
  // Check if payload contains XSS markers
  if (q.includes('<script>') || q.includes('alert(') || q.includes('onerror=')) {
    flag = flagService.generateFlag(req.user?.id || 0, 'xss-reflected');
  }

  // Returns the query back unsanitized
  res.json({
    query: q,
    results: [`No items found for "${q}"`],
    flag: flag
  });
});

// 3. IDOR - User Profile
router.get('/user/:id', async (req, res) => {
  const targetId = req.params.id;
  // In a real app, we'd check if req.user.id === targetId
  // Here we don't, allowing IDOR.
  
  try {
    const [rows] = await db.query('SELECT id, username, email, rank_title FROM users WHERE id = ?', [targetId]);
    
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const userData = rows[0];
    let flag = null;
    
    // If they access ID 1 (Admin) and they aren't admin, give flag
    if (targetId == 1) {
      flag = flagService.generateFlag(req.user?.id || 0, 'idor-admin');
    }

    res.json({ success: true, data: userData, flag });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Broken Access Control - Admin Panel
router.get('/admin/stats', authenticate, async (req, res) => {
  // Flaw: Only checks if logged in, doesn't check role
  const flag = flagService.generateFlag(req.user.id, 'broken-access-control');
  
  res.json({
    success: true,
    stats: { total_users: 1337, system_load: '2.4%', uptime: '142 days' },
    flag
  });
});

// 5. Command Injection - Ping Tool
router.post('/tools/ping', async (req, res) => {
  const { host } = req.body;
  
  // Flaw: No sanitization of command string
  if (host.includes(';') || host.includes('&') || host.includes('|')) {
    const flag = flagService.generateFlag(req.user?.id || 0, 'command-injection');
    return res.json({ 
      output: `PING ${host} (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.042 ms`,
      flag 
    });
  }
  
  res.json({ output: `PING ${host} (127.0.0.1): 56 data bytes...` });
});

module.exports = router;
