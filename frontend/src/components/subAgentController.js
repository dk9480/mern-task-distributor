const bcrypt = require('bcryptjs');
const Agent = require('../models/Agent');

// Create Sub-Agent (by Agent)
exports.createSubAgent = async (req, res) => {
  const { name, email, mobile, password } = req.body;
  const createdBy = req.user.id; // Logged-in agent ID

  try {
    // Check if agent exists and is allowed to create sub-agents
    const parentAgent = await Agent.findById(createdBy);
    if (!parentAgent || parentAgent.userType === 'sub-agent') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create sub-agents'
      });
    }

    // Check if email already exists
    const existingAgent = await Agent.findOne({ email });
    if (existingAgent) {
      return res.status(400).json({
        success: false,
        message: 'Agent with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const subAgent = new Agent({
      name,
      email,
      mobile,
      password: hashedPassword,
      userType: 'sub-agent',
      parentAgent: createdBy,
      createdBy: createdBy
    });

    await subAgent.save();

    res.status(201).json({
      success: true,
      message: 'Sub-agent created successfully',
      data: subAgent
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get All Sub-Agents for an Agent
exports.getSubAgents = async (req, res) => {
  try {
    const agentId = req.user.id;

    const subAgents = await Agent.find({
      parentAgent: agentId,
      userType: 'sub-agent'
    }).select('-password');

    res.json({
      success: true,
      count: subAgents.length,
      data: subAgents
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get Single Sub-Agent
exports.getSubAgent = async (req, res) => {
  try {
    const subAgent = await Agent.findOne({
      _id: req.params.id,
      parentAgent: req.user.id,
      userType: 'sub-agent'
    }).select('-password');

    if (!subAgent) {
      return res.status(404).json({
        success: false,
        message: 'Sub-agent not found'
      });
    }

    res.json({
      success: true,
      data: subAgent
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update Sub-Agent
exports.updateSubAgent = async (req, res) => {
  const { name, mobile, password } = req.body;

  try {
    let subAgent = await Agent.findOne({
      _id: req.params.id,
      parentAgent: req.user.id,
      userType: 'sub-agent'
    });

    if (!subAgent) {
      return res.status(404).json({
        success: false,
        message: 'Sub-agent not found'
      });
    }

    subAgent.name = name || subAgent.name;
    subAgent.mobile = mobile || subAgent.mobile;

    if (password) {
      subAgent.password = await bcrypt.hash(password, 10);
    }

    await subAgent.save();

    res.json({
      success: true,
      message: 'Sub-agent updated successfully',
      data: subAgent
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete Sub-Agent
exports.deleteSubAgent = async (req, res) => {
  try {
    const subAgent = await Agent.findOneAndDelete({
      _id: req.params.id,
      parentAgent: req.user.id,
      userType: 'sub-agent'
    });

    if (!subAgent) {
      return res.status(404).json({
        success: false,
        message: 'Sub-agent not found'
      });
    }

    res.json({
      success: true,
      message: 'Sub-agent deleted successfully',
      deletedAgent: {
        id: subAgent._id,
        name: subAgent.name,
        email: subAgent.email
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};