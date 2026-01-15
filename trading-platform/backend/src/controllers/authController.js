const { User, Agent, Transaction, AgentAssignedUser } = require('../models');
const { Op } = require('sequelize');
const { withTransaction } = require('../utils/sequelizeTransactionWrapper');
const {
  generateUserToken,
  generateAgentToken,
  createAuditLog,
  getClientIp,
  generateReferCode
} = require('../utils/helpers');

// User Signup
exports.userSignup = async (req, res) => {
  try {
    const { username, email, mobileNumber, password, referCode } = req.body;

    if (!referCode) {
      return res.status(400).json({
        success: false,
        message: 'Referral code is required for signup'
      });
    }

    const { user, token } = await withTransaction(async (t) => {
      // Check if refer code belongs to an Agent
      let assignedAgentId = null;
      let referredById = null;

      const agent = await Agent.findOne({
        where: { referCode: referCode },
        transaction: t
      });

      if (agent) {
        assignedAgentId = agent.id;
      } else {
        // Check if refer code belongs to a User (for peer referral)
        const referrer = await User.findOne({
          where: { referCode: referCode },
          transaction: t
        });

        if (referrer) {
          referredById = referrer.id;
          // If the referrer has an assigned agent, the new user should also have that agent
          assignedAgentId = referrer.assignedAgentId;
        }
      }

      if (!assignedAgentId && !referredById) {
        throw { status: 400, message: 'Invalid referral code' };
      }

      // Check for existing user (username or email)
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [{ username }, { email }]
        },
        transaction: t
      });

      if (existingUser) {
        throw { status: 400, message: 'Username or email already exists' };
      }

      // Generate unique referCode
      let referCodeGenerated = generateReferCode();
      let collision = await User.findOne({ where: { referCode: referCodeGenerated }, transaction: t });
      while (collision) {
        referCodeGenerated = generateReferCode();
        collision = await User.findOne({ where: { referCode: referCodeGenerated }, transaction: t });
      }

      // Create User
      const newUser = await User.create({
        username,
        email,
        mobileNumber: mobileNumber,
        password,
        referCode: referCodeGenerated,
        referredById: referredById,
        assignedAgentId: assignedAgentId,
        accountBalance: 1000, // Initial balance for demo
        isActive: true,
        locale: 'en'
      }, { transaction: t });

      // Create Transaction for initial balance
      await Transaction.create({
        userId: newUser.id,
        type: 'adjustment',
        amount: 1000,
        oldBalance: 0,
        newBalance: 1000,
        status: 'completed',
        description: 'Initial demo balance'
      }, { transaction: t });

      // If assigned to an agent, update agent's assignedUsers junction
      if (assignedAgentId) {
        await AgentAssignedUser.findOrCreate({
          where: {
            agentId: assignedAgentId,
            userId: newUser.id
          },
          transaction: t
        });
      }

      const token = generateUserToken(newUser.id);
      return { user: newUser, token };
    });

    // Audit log (outside transaction)
    await createAuditLog({
      action: 'user_created',
      performedBy: user.id,
      performedByModel: 'User',
      targetUser: user.id,
      newData: { username, email },
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        accountBalance: user.accountBalance,
        referCode: user.referCode,
        locale: user.locale
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    const status = error.status || 500;
    const message = error.message || 'Error creating user account';
    res.status(status).json({ success: false, message, error: message });
  }
};

// User Login
exports.userLogin = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    // Use scope to include password
    const user = await User.scope('withPassword').findOne({
      where: {
        [Op.or]: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'incorrect_username'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'incorrect_password'
      });
    }

    // Generate token
    const token = generateUserToken(user.id);

    // Create audit log
    createAuditLog({ // Fire and forget
      action: 'login',
      performedBy: user.id,
      performedByModel: 'User',
      targetUser: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        accountBalance: user.accountBalance,
        role: user.role,
        locale: user.locale
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Agent/Admin Login
exports.agentLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find agent
    const agent = await Agent.scope('withPassword').findOne({
      where: { username },
      include: ['permissions'] // Eager load permissions
    });

    if (!agent) {
      return res.status(401).json({
        success: false,
        message: 'incorrect_username'
      });
    }

    if (!agent.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await agent.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'incorrect_password'
      });
    }

    // Generate token
    const token = generateAgentToken(agent.id, agent.role);

    // Create audit log
    createAuditLog({
      action: 'login',
      performedBy: agent.id,
      performedByModel: 'Agent',
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });

    // Get permissions list suitable for frontend
    const permissions = agent.permissions ? agent.permissions.map(p => p.permission) : [];

    res.json({
      success: true,
      message: 'Login successful',
      token,
      agent: {
        id: agent.id,
        username: agent.username,
        role: agent.role,
        permissions: permissions,
        locale: agent.locale,
        referCode: agent.referCode
      }
    });
  } catch (error) {
    console.error('Agent login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
};

// Change Agent/Admin Password
exports.changeAgentPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const agent = await Agent.scope('withPassword').findByPk(req.agent.id);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found'
      });
    }

    // Check current password
    const isPasswordValid = await agent.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    agent.password = newPassword;
    await agent.save();

    // Create audit log
    createAuditLog({
      action: 'password_changed',
      performedBy: agent.id,
      performedByModel: 'Agent',
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password'
    });
  }
};

// Get current user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    // User already excluded password by default scope

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
};