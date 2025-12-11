const express = require('express');
const router = express.Router();
const { agentAuth } = require('../middleware/authMiddleware');
const { agentLogin, getAgentProfile } = require('../controllers/agentAuthController');

// @route   POST /api/agent-auth/login
router.post('/login', agentLogin);

// @route   GET /api/agent-auth/profile
router.get('/profile', agentAuth, getAgentProfile);

module.exports = router;