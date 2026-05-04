const express = require('express');
const router = express.Router();
const labManager = require('../services/labManager');
const { authenticate } = require('../middleware/auth');

// Start Lab
router.post('/start', authenticate, async (req, res) => {
    const { challengeSlug } = req.body;
    const userId = req.user.id;

    try {
        const lab = await labManager.startLab(userId, challengeSlug);
        res.json({ success: true, lab });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to start lab environment', error: error.message });
    }
});

// Terminate Lab
router.post('/terminate', authenticate, async (req, res) => {
    const userId = req.user.id;
    try {
        await labManager.terminateLab(userId);
        res.json({ success: true, message: 'Lab terminated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to terminate lab' });
    }
});

// Get Lab Status
router.get('/status', authenticate, (req, res) => {
    const userId = req.user.id;
    const lab = labManager.getLabStatus(userId);
    res.json({ success: true, lab });
});

module.exports = router;
