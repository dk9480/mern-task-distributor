const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    console.log('🔐 Auth Middleware - Checking authentication...');
    
    // Check for JWT token in headers
    const token = req.header('x-auth-token');
    
    console.log('📨 Received token:', token ? 'Yes' : 'No');
    console.log('🔍 All headers:', JSON.stringify(req.headers, null, 2));
    
    if (!token) {
      console.log('❌ No token provided in x-auth-token header');
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified. User:', decoded);
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ Token verification error:', err.message);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

const agentAuth = async (req, res, next) => {
  try {
    console.log('🔐 Agent Auth Middleware - Checking agent authentication...');
    
    const token = req.header('x-auth-token');
    
    console.log('📨 Received agent token:', token ? 'Yes' : 'No');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Agent token verified:', decoded);
    
    if (!['agent', 'sub-agent'].includes(decoded.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Agent access required'
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error('❌ Agent token verification error:', err);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
};

module.exports = { auth, adminAuth, agentAuth };