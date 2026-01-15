const jwt = require('jsonwebtoken');
const { User, Agent } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if this is a user or agent token
    if (decoded.role === 'user') {
      const user = await User.findByPk(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error();
      }
      req.user = user;
      req.userType = 'user';
    } else if (decoded.role === 'agent' || decoded.role === 'admin') {
      // Eager load permissions for Role Based Access Control
      const agent = await Agent.findByPk(decoded.agentId, {
        include: ['permissions']
      });

      if (!agent || !agent.isActive) {
        throw new Error();
      }

      // Flatten permissions for easy checking in roleCheck.js
      // agent.permissions is an array of AgentPermission objects here
      // We transform it into an array of permission strings
      const permissionStrings = agent.permissions ? agent.permissions.map(p => p.permission) : [];

      // Override the property with the simple string array so checkPermission can use .includes()
      // We use setDataValue to avoid Sequelize validation errors if we were saving, but helpful for runtime req object
      agent.setDataValue('permissions', permissionStrings);

      // Also set it on the plain object in case something uses .toJSON()
      agent.permissions = permissionStrings;

      req.agent = agent;
      req.userType = 'agent';
    } else {
      throw new Error('Invalid token');
    }

    req.token = token;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Please authenticate'
    });
  }
};

module.exports = authMiddleware;