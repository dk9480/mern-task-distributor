const express = require('express');
const router = express.Router();
const { createAgent, getAgents } = require('../controllers/agentController');

// POST /api/agents
router.post('/', createAgent);

// GET /api/agents
router.get('/', getAgents);

module.exports = router;
