const Agent = require('../models/Agent');
const bcrypt = require('bcryptjs');

// Create Agent
exports.createAgent = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  try {
    // Check if the agent already exists
    const existingAgent = await Agent.findOne({ email: email.toLowerCase().trim() });
    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: 'Agent already exists',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new agent with proper userType
    const agent = new Agent({
      name,
      email: email.toLowerCase().trim(),
      mobile,
      password: hashedPassword,
      userType: 'agent', // Explicitly set to 'agent'
      createdBy: req.user ? req.user.id : null,
      isActive: true // Ensure agent is active
    });

    await agent.save();

    // Return agent data without password
    const agentData = {
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
      userType: agent.userType,
      isActive: agent.isActive,
      createdAt: agent.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Agent created successfully',
      data: agentData,
    });
  } catch (err) {
    console.error(err);
    
    // Handle validation errors specifically
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: err.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Get All Agents
exports.getAgents = async (req, res) => {
  try {
    const agents = await Agent.find().select('-password');
    res.json({
      success: true,
      count: agents.length,
      data: agents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Get Single Agent
exports.getAgent = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }
    res.json({
      success: true,
      data: agent,
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Update Agent
exports.updateAgent = async (req, res) => {
  const { name, email, mobile, password } = req.body;

  try {
    let agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }

    // Update agent details
    agent.name = name || agent.name;
    agent.email = email ? email.toLowerCase().trim() : agent.email;
    agent.mobile = mobile || agent.mobile;

    if (password) {
      agent.password = await bcrypt.hash(password, 10);
    }

    // Save the updated agent
    await agent.save();

    // Return without password
    const agentData = {
      _id: agent._id,
      name: agent.name,
      email: agent.email,
      mobile: agent.mobile,
      userType: agent.userType,
      isActive: agent.isActive,
      updatedAt: agent.updatedAt
    };

    res.json({
      success: true,
      message: 'Agent updated successfully',
      data: agentData,
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// Delete Agent with clear message
exports.deleteAgent = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }

    res.json({
      success: true,
      message: 'Agent deleted successfully',
      deletedAgent: {
        id: agent._id,
        name: agent.name,
        email: agent.email,
      },
    });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
