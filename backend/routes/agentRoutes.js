const express = require('express');
const router = express.Router();
const { 
  createAgent, 
  getAgents,
  getAgent,
  updateAgent,
  deleteAgent
} = require('../controllers/agentController');

// @route   POST api/agents
// @desc    Create an agent
router.post('/', createAgent);

// @route   GET api/agents
// @desc    Get all agents
router.get('/', getAgents);

// @route   GET api/agents/:id
// @desc    Get single agent
router.get('/:id', getAgent);

// @route   PUT api/agents/:id
// @desc    Update agent
router.put('/:id', updateAgent);

// @route   DELETE api/agents/:id
// @desc    Delete agent
router.delete('/:id', deleteAgent);


module.exports = router;
