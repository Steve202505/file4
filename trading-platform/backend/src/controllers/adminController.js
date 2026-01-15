const { Agent, AuditLog, User, GlobalSettings, sequelize } = require('../models');
const { hashPassword, createAuditLog, getClientIp, generateReferCode } = require('../utils/helpers');
const { Op } = require('sequelize');

// Get all agents
exports.getAllAgents = async (req, res) => {
  try {
    // Permission fix simplified
    if (req.agent.role === 'admin') {
      // Ideally permissions are managed via UI, but keeping legacy check safely
      // But permissions are now in a separate table or getter
      // Let's assume frontend handles permissions display or we just return them
    }

    const agents = await Agent.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, agents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching agents' });
  }
};

// Get audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, targetId, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (action) where.action = action;
    if (targetId) {
      where[Op.or] = [
        { targetUserId: targetId },
        { targetAgentId: targetId },
        { performedById: targetId }
      ];
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        { model: User, as: 'targetUser', attributes: ['username'] },
        { model: Agent, as: 'targetAgent', attributes: ['username'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      logs: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching logs' });
  }
};

// Create new agent
exports.createAgent = async (req, res) => {
  try {
    const { username, password, role = 'agent' } = req.body;

    const existingAgent = await Agent.findOne({ where: { username } });
    if (existingAgent) return res.status(400).json({ success: false, message: 'Username already exists' });

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) return res.status(400).json({ success: false, message: 'Username exists as User' });

    let referCode = generateReferCode();

    // Simple retry logic for collision
    let retries = 3;
    let agent;
    while (retries > 0) {
      try {
        agent = await Agent.create({
          username,
          password,
          role,
          isActive: true,
          referCode: referCode
        });
        break;
      } catch (e) {
        if (e.name === 'SequelizeUniqueConstraintError') {
          referCode = generateReferCode();
          retries--;
        } else throw e;
      }
    }

    if (!agent) throw new Error('Failed to generate unique refer code');

    createAuditLog({
      action: 'agent_created',
      performedBy: req.agent.id,
      performedByModel: 'Agent',
      targetAgent: agent.id,
      newData: { username, role },
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'Agent created',
      agent: { id: agent.id, username: agent.username, role: agent.role, isActive: agent.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update agent
exports.updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, isActive } = req.body;

    if (id === req.agent.id) return res.status(400).json({ success: false, message: 'Cannot modify self' });

    const agent = await Agent.findByPk(id);
    if (!agent) return res.status(404).json({ success: false, message: 'Not found' });

    const oldData = { username: agent.username, role: agent.role, isActive: agent.isActive };

    if (username && username !== agent.username) {
      if (await Agent.findOne({ where: { username } })) return res.status(400).json({ success: false, message: 'Taken' });
      if (await User.findOne({ where: { username } })) return res.status(400).json({ success: false, message: 'Taken by User' });
      agent.username = username;
    }
    if (password) agent.password = password;
    if (isActive !== undefined) agent.isActive = isActive;

    await agent.save();

    createAuditLog({
      action: 'agent_updated',
      performedBy: req.agent.id,
      performedByModel: 'Agent',
      targetAgent: agent.id,
      oldData,
      newData: req.body
    });

    res.json({ success: true, message: 'Updated', agent });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// Delete agent
exports.deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.agent.id) return res.status(400).json({ success: false, message: 'Cannot delete self' });

    const agent = await Agent.findByPk(id);
    if (!agent) return res.status(404).json({ success: false, message: 'Not found' });

    await agent.destroy();

    // Set users assigned to null
    await User.update({ assignedAgentId: null }, { where: { assignedAgentId: id } });

    createAuditLog({ action: 'agent_deleted', performedBy: req.agent.id, targetAgent: id });

    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error' });
  }
};

// Global Settings
exports.getGlobalSettings = async (req, res) => {
  try {
    const settings = await GlobalSettings.getSettings();
    res.json({ success: true, settings: { globalSupportMessage: settings.globalSupportMessage } });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.updateGlobalSettings = async (req, res) => {
  try {
    const { globalSupportMessage } = req.body;
    if (globalSupportMessage === undefined) return res.status(400).json({ success: false, message: 'Required' });

    let settings = await GlobalSettings.findOne();
    if (!settings) settings = await GlobalSettings.create({});

    settings.globalSupportMessage = globalSupportMessage;
    await settings.save();

    createAuditLog({
      action: 'global_settings_updated',
      performedBy: req.agent.id,
      performedByModel: 'Agent',
      newData: { globalSupportMessage }
    });

    res.json({ success: true, message: 'Updated', settings: { globalSupportMessage } });
  } catch (e) { res.status(500).json({ success: false }); }
};