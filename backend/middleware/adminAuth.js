const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    req.user = { id: user._id, role: 'admin' };
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

module.exports = adminAuth;