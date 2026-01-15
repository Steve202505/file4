const { User, Agent, Transaction, WinLossControl, AuditLog, GlobalSettings, BankCard, CryptoWallet, Withdrawal, sequelize } = require('../models');
const { createAuditLog, getClientIp } = require('../utils/helpers');
const { withTransaction } = require('../utils/sequelizeTransactionWrapper');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// Get user profile (for user themselves)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Agent, as: 'assignedAgent', attributes: ['username', 'role'] },
        { model: User, as: 'referrer', attributes: ['username', 'email'] },
        { model: WinLossControl, as: 'winLossControl' } // Populate one-to-one
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent audit logs
    const recentLogs = await AuditLog.findAll({
      where: { targetUserId: user.id },
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [{ model: Agent, as: 'targetAgent', attributes: ['username'] }]
    });

    // Get global support message
    let globalSupportMessage = '';
    try {
      const globalSettings = await GlobalSettings.getSettings();
      globalSupportMessage = globalSettings.globalSupportMessage || '';
    } catch (err) {
      console.warn('Could not fetch global settings:', err);
    }

    res.json({
      success: true,
      user: {
        ...user.toJSON(),
        recentActivity: recentLogs,
        globalSupportMessage
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { email, mobileNumber, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.scope('withPassword').findByPk(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldData = {
      email: user.email,
      mobileNumber: user.mobileNumber
    };

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ success: false, message: 'Email is already registered' });
      }
      user.email = email;
    }

    if (mobileNumber && mobileNumber !== user.mobileNumber) {
      // Find if anyone else has this mobile
      // Note: mobileNumber is not unique in schema? Schema says allow Null false, but check unique migration/model.
      // Standard User model has unique constraint on mobile usually, let's check. 
      // Migration doesn't set unique on mobileNumber explicitly in snippet provided?
      // Let's assume unique check is desired.
      const existingUser = await User.findOne({ where: { mobileNumber: mobileNumber } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ success: false, message: 'Mobile number is already registered' });
      }
      user.mobileNumber = mobileNumber;
    }

    if (currentPassword && newPassword) {
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      user.password = newPassword; // Hook will hash it
    }

    await user.save();

    createAuditLog({
      action: 'user_updated',
      performedBy: user.id,
      performedByModel: 'User',
      targetUser: user.id,
      oldData,
      newData: {
        email: user.email,
        mobileNumber: user.mobileNumber,
        passwordChanged: !!(currentPassword && newPassword)
      },
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        mobileNumber: user.mobileNumber
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

// Get user balance
exports.getUserBalance = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['accountBalance'] });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const balance = parseFloat(user.accountBalance);
    res.json({
      success: true,
      balance,
      availableBalance: balance * 0.95, // logic from old controller
      currency: 'USD'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching balance' });
  }
};

// Request Withdrawal
exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, method, accountDetails } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
    }

    const detailsToStore = typeof accountDetails === 'object' ? JSON.stringify(accountDetails) : accountDetails;

    const result = await withTransaction(async (t) => {
      // Lock user row
      const user = await User.findByPk(userId, { transaction: t, lock: true });
      if (!user) throw { status: 404, message: 'User not found' };

      if (user.creditScore < 100) {
        throw { status: 403, message: 'Minimum 100 Credit Score required for withdrawal' };
      }

      if (parseFloat(user.accountBalance) < parseFloat(amount)) {
        throw { status: 400, message: 'Insufficient balance' };
      }

      const oldBalance = parseFloat(user.accountBalance);
      await user.decrement('accountBalance', { by: amount, transaction: t });
      const newBalance = oldBalance - parseFloat(amount);

      // Create Transaction
      const transaction = await Transaction.create({
        userId: user.id,
        type: 'withdrawal',
        amount: -amount,
        oldBalance: oldBalance,
        newBalance: newBalance,
        status: 'pending',
        description: `Withdrawal request (${method})`
      }, { transaction: t });

      // Create Withdrawal
      const withdrawal = await Withdrawal.create({
        userId: user.id,
        amount,
        method,
        accountDetails: detailsToStore,
        status: 'pending',
        transactionId: transaction.id
      }, { transaction: t });

      return { withdrawal, remainingBalance: newBalance };
    });

    createAuditLog({
      action: 'withdrawal_requested',
      performedBy: userId,
      performedByModel: 'User',
      targetUser: userId,
      newData: { amount, method, status: 'pending', withdrawalId: result.withdrawal.id },
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: result.withdrawal,
      remainingBalance: result.remainingBalance
    });

  } catch (error) {
    console.error('Request withdrawal error:', error);
    const status = error.status || 500;
    const message = error.message || 'Error submitting withdrawal request';
    res.status(status).json({ success: false, message });
  }
};

// Get user win/loss control
exports.getUserWinLossControl = async (req, res) => {
  try {
    const winLossControl = await WinLossControl.findOne({
      where: { userId: req.user.id },
      include: [{ model: Agent, as: 'modifiedBy', attributes: ['username', 'role'] }]
    });

    res.json({
      success: true,
      winLossControl: winLossControl || null,
      message: winLossControl ? undefined : 'No settings found'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching settings' });
  }
};

// Get referrals
exports.getUserReferralInfo = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['referCode'],
      include: [{ model: User, as: 'referrer', attributes: ['username', 'email', 'createdAt'] }]
    });

    const referredUsers = await User.findAll({
      where: { referredById: req.user.id },
      attributes: ['username', 'email', 'accountBalance', 'createdAt', 'isActive'],
      order: [['createdAt', 'DESC']]
    });

    // Calc stats
    const totalReferred = referredUsers.length;
    const activeReferred = referredUsers.filter(u => u.isActive).length;
    let totalEarnings = 0;
    let pendingEarnings = 0;

    referredUsers.forEach(u => {
      totalEarnings += parseFloat(u.accountBalance) * 0.01;
      pendingEarnings += parseFloat(u.accountBalance) * 0.005;
    });

    res.json({
      success: true,
      referralInfo: {
        referCode: user.referCode,
        referredBy: user.referrer,
        referredUsers,
        stats: { totalReferred, activeReferred, totalEarnings, pendingEarnings }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching referral info' });
  }
};

// Get activity logs
exports.getUserActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { performedById: req.user.id, performedByModel: 'User' },
        { targetUserId: req.user.id }
      ]
    };

    const { count, rows } = await AuditLog.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      logs: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching logs' });
  }
};

// Get transactions
exports.getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching transactions' });
  }
};

// Check username
exports.checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || username.length < 3) return res.status(400).json({ success: false, message: 'Too short' });

    const userCount = await User.count({ where: { username } });
    const agentCount = await Agent.count({ where: { username } });
    const isAvailable = userCount === 0 && agentCount === 0;

    res.json({ available: isAvailable, message: isAvailable ? 'Available' : 'Taken' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error checking username' });
  }
};

// Get assigned agent
exports.getAssignedAgent = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Agent, as: 'assignedAgent', attributes: ['id', 'username', 'role', 'isActive', 'createdAt'] }]
    });

    if (!user || !user.assignedAgent) {
      return res.status(404).json({ success: false, message: 'No agent assigned' });
    }

    const assignedUsersCount = await User.count({ where: { assignedAgentId: user.assignedAgent.id } });
    const activeUsersCount = await User.count({ where: { assignedAgentId: user.assignedAgent.id, isActive: true } });

    res.json({
      success: true,
      agent: {
        ...user.assignedAgent.toJSON(),
        stats: { totalAssignedUsers: assignedUsersCount, activeUsers: activeUsersCount }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching agent' });
  }
};

exports.userLogout = async (req, res) => {
  createAuditLog({ // Fire and forget
    action: 'logout',
    performedBy: req.user.id,
    performedByModel: 'User',
    targetUser: req.user.id,
    ipAddress: getClientIp(req),
    userAgent: req.headers['user-agent']
  });
  res.json({ success: true, message: 'Logged out' });
};

exports.updateLocale = async (req, res) => {
  try {
    await User.update({ locale: req.body.locale }, { where: { id: req.user.id } });
    res.json({ success: true, message: 'Locale updated' });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.validateSession = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Agent, as: 'assignedAgent', attributes: ['username', 'role'] }]
    });
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, user, isValid: true, expiresIn: '24h' });
  } catch (e) { res.status(500).json({ success: false }); }
};

// --- Bank Cards ---
exports.addBankCard = async (req, res) => {
  try {
    const { bankName, bankAccountName, accountNumber, username } = req.body;
    const card = await BankCard.create({
      userId: req.user.id,
      bankName: bankName,
      accountName: bankAccountName,
      accountNumber: accountNumber,
      username,
      status: 'active'
    });
    res.status(201).json({ success: true, message: 'Added', bankCard: card });
  } catch (error) { res.status(500).json({ success: false, message: 'Error adding card' }); }
};

exports.getBankCards = async (req, res) => {
  try {
    const cards = await BankCard.findAll({ where: { userId: req.user.id, status: 'active' } });
    res.json({ success: true, cards });
  } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
};

exports.deleteBankCard = async (req, res) => {
  try {
    await BankCard.update({ status: 'inactive' }, { where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
};

// --- Crypto Wallets ---
exports.addCryptoWallet = async (req, res) => {
  try {
    const { walletAddress, network, alias } = req.body;
    const wallet = await CryptoWallet.create({
      userId: req.user.id,
      walletAddress: walletAddress,
      network: network || 'TRC20',
      alias: alias || 'My Wallet',
      status: 'active'
    });
    res.status(201).json({ success: true, message: 'Added', cryptoWallet: wallet });
  } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
};

exports.getCryptoWallets = async (req, res) => {
  try {
    const wallets = await CryptoWallet.findAll({ where: { userId: req.user.id, status: 'active' } });
    res.json({ success: true, wallets });
  } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
};

exports.deleteCryptoWallet = async (req, res) => {
  try {
    await CryptoWallet.update({ status: 'inactive' }, { where: { id: req.params.id, userId: req.user.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) return res.status(400).json({ success: false, message: 'Mismatch' });

    const user = await User.scope('withPassword').findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect old password' });

    user.password = newPassword;
    await user.save();

    createAuditLog({
      action: 'password_changed',
      performedBy: user.id,
      performedByModel: 'User',
      targetUser: user.id,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });
    res.json({ success: true, message: 'Changed' });
  } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
};

exports.getDepositAddresses = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Agent, as: 'assignedAgent' }]
    });

    let bankCards = [];
    let cryptoWallets = [];

    if (user.assignedAgent) {
      bankCards = await BankCard.findAll({ where: { userId: user.assignedAgent.id, status: 'active' }, order: [['createdAt', 'DESC']] });
      cryptoWallets = await CryptoWallet.findAll({ where: { userId: user.assignedAgent.id, status: 'active' }, order: [['createdAt', 'DESC']] });
    }

    if (bankCards.length === 0 && cryptoWallets.length === 0) {
      const admin = await Agent.findOne({ where: { role: 'admin', isActive: true }, order: [['createdAt', 'ASC']] });
      if (admin) {
        bankCards = await BankCard.findAll({ where: { userId: admin.id, status: 'active' }, order: [['createdAt', 'DESC']] });
        cryptoWallets = await CryptoWallet.findAll({ where: { userId: admin.id, status: 'active' }, order: [['createdAt', 'DESC']] });
      }
    }
    res.json({ success: true, bankCards, cryptoWallets });
  } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
};