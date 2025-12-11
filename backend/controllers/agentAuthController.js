const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Agent = require('../models/Agent');

// Agent Login
exports.agentLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('🔐 Agent login attempt for:', email);
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find agent (both agents created by admin and sub-agents can login)
    const agent = await Agent.findOne({ 
      email: email.toLowerCase().trim()
    }).select('+password'); // Include password for comparison
    
    if (!agent) {
      console.log('❌ Agent not found:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if agent is allowed to login
    if (!['agent', 'sub-agent'].includes(agent.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Agent account required.'
      });
    }

    if (!agent.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch) {
      console.log('❌ Password mismatch for:', email);
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const payload = {
      id: agent._id,
      userType: agent.userType,
      parentAgent: agent.parentAgent
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: '24h' 
    });

    console.log('✅ Login successful for:', email);
    
    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      data: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
        userType: agent.userType,
        parentAgent: agent.parentAgent
      }
    });

  } catch (err) {
    console.error('🔥 Agent login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get agent profile
exports.getAgentProfile = async (req, res) => {
  try {
    const agent = await Agent.findById(req.user.id).select('-password');
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    res.json({
      success: true,
      data: agent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};