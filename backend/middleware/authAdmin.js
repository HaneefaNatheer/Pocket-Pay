const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT and ensure the user has admin role
module.exports = async (req, res, next) => {
  try {
    const token = req.cookies?.token || (req.headers['authorization'] ? req.headers['authorization'].split(' ')[1] : null);
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
