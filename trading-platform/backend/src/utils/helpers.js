const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { AuditLog } = require('../models');

// Generate JWT token for user
const generateUserToken = (userId) => {
  return jwt.sign(
    { userId, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Generate JWT token for agent/admin
const generateAgentToken = (agentId, role) => {
  return jwt.sign(
    { agentId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.AGENT_JWT_EXPIRES_IN || '8h' }
  );
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

// Generate random refer code
const generateReferCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Create audit log
const createAuditLog = async (data) => {
  try {
    // Check if performedByModel is strictly 'User' or 'Agent' to match ENUM
    // Sequelize ENUMs are strict
    const performedByModel = data.performedByModel || 'Agent';
    if (!['User', 'Agent'].includes(performedByModel)) {
      console.warn('Invalid performByModel for AuditLog:', performedByModel);
      return;
    }

    const payload = {
      action: data.action,
      performedById: data.performedBy,
      performedByModel: performedByModel,
      targetUserId: data.targetUser,
      targetAgentId: data.targetAgent,
      oldData: data.oldData,
      newData: data.newData,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    };

    await AuditLog.create(payload);
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

// Get client IP address
const getClientIp = (req) => {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
};

module.exports = {
  generateUserToken,
  generateAgentToken,
  hashPassword,
  comparePassword,
  generateReferCode,
  createAuditLog,
  getClientIp
};