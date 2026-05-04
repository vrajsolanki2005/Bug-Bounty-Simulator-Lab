const express = require('express');
const { authenticate } = require('../middleware/auth');
const { processCommand } = require('../services/terminalService');

const router = express.Router();

// ── POST /api/terminal/execute ──────────────────────────────────────
// HTTP fallback for terminal commands (WebSocket is preferred)
router.post('/execute', authenticate, async (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ success: false, message: 'Command required' });

  const lines = [];
  for await (const line of processCommand(command)) {
    lines.push(line);
  }

  res.json({ success: true, output: lines });
});

module.exports = router;
