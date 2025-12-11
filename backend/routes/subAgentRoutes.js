const express = require('express');
const router = express.Router();
const { agentAuth } = require('../middleware/authMiddleware');
const {
  createSubAgent,
  getSubAgents,
  getSubAgent,
  updateSubAgent,
  deleteSubAgent
} = require('../controllers/subAgentController');

// Protect all routes with agent authentication
router.use(agentAuth);

// @route   POST /api/sub-agents
router.post('/', createSubAgent);

// @route   GET /api/sub-agents
router.get('/', getSubAgents);

// @route   GET /api/sub-agents/:id
router.get('/:id', getSubAgent);

// @route   PUT /api/sub-agents/:id
router.put('/:id', updateSubAgent);

// @route   DELETE /api/sub-agents/:id
router.delete('/:id', deleteSubAgent);

module.exports = router;