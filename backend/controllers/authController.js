const User = require('../models/User');
const Agent = require('../models/Agent');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check in both User and Agent collections
    let user = await User.findOne({ email });
    let isAgent = false;

    if (!user) {
      user = await Agent.findOne({ email });
      if (!user) return res.status(400).json({ msg: 'Invalid credentials' });
      isAgent = true;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = {
      id: user._id,
      role: isAgent ? (user.userType || 'agent') : 'admin'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: isAgent ? (user.userType || 'agent') : 'admin',  // Consistent role assignment
        userType: isAgent ? user.userType : 'admin'  // Add userType for clarity
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
