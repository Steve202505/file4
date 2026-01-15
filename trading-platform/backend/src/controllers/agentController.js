const { User, Agent, WinLossControl, Transaction, BankCard, CryptoWallet, AgentAssignedUser, Trade, sequelize } = require('../models');
const { hashPassword, createAuditLog, getClientIp, generateReferCode } = require('../utils/helpers');
const { withLockingTransaction, withTransaction } = require('../utils/sequelizeTransactionWrapper');
const { Op } = require('sequelize');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    let { page = 1, limit = 20, search = '', status = 'all', userId, mobileNumber, startTime, endTime } = req.query;
    const offset = (Math.max(1, parseInt(page)) - 1) * limit;

    const where = {};

    if (userId) {
      if (userId.length === 36) where.id = userId; // UUID length
      else where.id = { [Op.like]: `%${userId}%` };
    }
    if (mobileNumber) where.mobileNumber = { [Op.like]: `%${mobileNumber}%` };

    if (startTime || endTime) {
      where.createdAt = {};
      if (startTime) where.createdAt[Op.gte] = new Date(startTime);
      if (endTime) where.createdAt[Op.lte] = new Date(endTime);
    }

    if (search && !userId && !mobileNumber) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { mobileNumber: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status === 'active') where.isActive = true;
    else if (status === 'inactive') where.isActive = false;

    if (req.agent.role === 'agent') {
      where.assignedAgentId = req.agent.id;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'transactionPassword'] },
      include: [
        { model: Agent, as: 'assignedAgent', attributes: ['username'] },
        { model: WinLossControl, as: 'winLossControl' }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      users: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

// Create User
exports.createUser = async (req, res) => {
  try {
    const { username, email, mobileNumber, resetPassword, transactionPassword, walletAddress, creditScore, vipLevel, isSimulated, controlLevel, isActive, accountBalance = 0 } = req.body;

    if (!username || !email) return res.status(400).json({ success: false, message: 'Required fields missing' });

    const result = await withTransaction(async (t) => {
      // Check existing
      const existing = await User.findOne({
        where: { [Op.or]: [{ username }, { email }, { mobileNumber }] },
        transaction: t
      });
      if (existing) throw { status: 400, message: 'User already exists' };

      let referCode = generateReferCode();
      while (await User.findOne({ where: { referCode: referCode }, transaction: t })) {
        referCode = generateReferCode();
      }

      const newUser = await User.create({
        username,
        email,
        mobileNumber,
        password: resetPassword || '123456',
        transactionPassword: transactionPassword || '123456',
        walletAddress,
        creditScore: creditScore || 0,
        vipLevel: vipLevel || 0,
        isSimulated: isSimulated || false,
        isActive: isActive !== undefined ? isActive : true,
        accountBalance: accountBalance,
        referCode,
        assignedAgentId: req.agent.id
      }, { transaction: t });

      if (controlLevel && controlLevel !== 'none') {
        await WinLossControl.create({
          userId: newUser.id,
          controlLevel,
          isActive: true,
          modifiedById: req.agent.id
        }, { transaction: t });
      }

      // Junction Update
      await AgentAssignedUser.create({ agentId: req.agent.id, userId: newUser.id }, { transaction: t });

      if (accountBalance > 0) {
        await Transaction.create({
          userId: newUser.id,
          type: 'adjustment',
          amount: accountBalance,
          oldBalance: 0,
          newBalance: accountBalance,
          status: 'completed',
          description: 'Initial balance',
          performedById: req.agent.id
        }, { transaction: t });
      }

      return newUser;
    });

    createAuditLog({
      action: 'user_created_by_agent',
      performedBy: req.agent.id,
      performedByModel: 'Agent',
      targetUser: result.id,
      newData: req.body,
      ipAddress: getClientIp(req),
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({ success: true, message: 'User created', user: result });

  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

// Get User
exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Agent, as: 'assignedAgent', attributes: ['username'] }, { model: WinLossControl, as: 'winLossControl' }]
    });

    if (!user) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.agent.role === 'agent' && user.assignedAgentId !== req.agent.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, user: { ...user.toJSON(), inviter: user.assignedAgent ? user.assignedAgent.username : 'None' } });
  } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found' });

    if (req.agent.role === 'agent' && user.assignedAgentId !== req.agent.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Apply updates manual mapping/validation would be better but keeping it robust
    if (updateData.username) user.username = updateData.username;
    if (updateData.email) user.email = updateData.email;
    if (updateData.mobileNumber) user.mobileNumber = updateData.mobileNumber;
    if (updateData.walletAddress) user.walletAddress = updateData.walletAddress;
    if (updateData.resetPassword) user.password = updateData.resetPassword;
    if (updateData.transactionPassword) user.transactionPassword = updateData.transactionPassword;
    if (updateData.creditScore !== undefined) user.creditScore = updateData.creditScore;
    if (updateData.vipLevel !== undefined) user.vipLevel = updateData.vipLevel;
    if (updateData.isSimulated !== undefined) user.isSimulated = updateData.isSimulated;
    if (updateData.isActive !== undefined) user.isActive = updateData.isActive;
    if (updateData.supportMessage !== undefined) user.supportMessage = updateData.supportMessage;

    await user.save();

    if (updateData.controlLevel) {
      let ctrl = await WinLossControl.findOne({ where: { userId: id } });
      if (ctrl) {
        ctrl.controlLevel = updateData.controlLevel;
        ctrl.isActive = true;
        ctrl.modifiedById = req.agent.id;
        await ctrl.save();
      } else {
        await WinLossControl.create({
          userId: id,
          controlLevel: updateData.controlLevel,
          isActive: true,
          modifiedById: req.agent.id
        });
      }
    }

    createAuditLog({
      action: 'user_updated_comprehensive',
      performedBy: req.agent.id,
      performedByModel: 'Agent',
      targetUser: id,
      newData: updateData
    });

    res.json({ success: true, message: 'Updated', user });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// Adjust Balance
exports.adjustBalance = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, description } = req.body;

    const result = await withLockingTransaction(async (t) => {
      const user = await User.findByPk(id, { transaction: t, lock: true });
      if (!user) throw { status: 404, message: 'User not found' };

      if (req.agent.role === 'agent' && user.assignedAgentId !== req.agent.id) throw { status: 403, message: 'Denied' };

      const oldBalance = parseFloat(user.accountBalance);
      const adjustment = type === 'subtract' ? -Math.abs(amount) : Math.abs(amount);

      await user.increment('accountBalance', { by: adjustment, transaction: t });
      const newBalance = oldBalance + adjustment;

      await Transaction.create({
        userId: id,
        type: 'adjustment',
        amount: adjustment,
        oldBalance: oldBalance,
        newBalance: newBalance,
        status: 'completed',
        description: description || `Manual ${type}`,
        performedById: req.agent.id
      }, { transaction: t });

      return newBalance;
    });

    createAuditLog({
      action: 'balance_adjusted',
      performedBy: req.agent.id,
      performedByModel: 'Agent',
      targetUser: id,
      newData: { amount, type }
    });
    res.json({ success: true, message: 'Adjusted', newBalance: result });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, message: e.message || 'Balance adjustment failed' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.update({ isActive: false }, { where: { id } });
    // Cleanup assignments
    await AgentAssignedUser.destroy({ where: { userId: id } });

    createAuditLog({
      action: 'user_deleted',
      performedBy: req.agent.id,
      performedByModel: 'Agent',
      targetUser: id
    });
    res.json({ success: true, message: 'Deactivated' });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.updateLocale = async (req, res) => {
  try {
    await Agent.update({ locale: req.body.locale }, { where: { id: req.agent.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.updateWinLossControl = async (req, res) => {
  try {
    const { id } = req.params;
    const { controlLevel, isActive, notes } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.agent.role === 'agent' && user.assignedAgentId !== req.agent.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    let ctrl = await WinLossControl.findOne({ where: { userId: id } });
    if (ctrl) {
      ctrl.controlLevel = controlLevel;
      ctrl.isActive = isActive;
      if (notes) ctrl.notes = notes;
      ctrl.modifiedById = req.agent.id;
      await ctrl.save();
    } else {
      ctrl = await WinLossControl.create({
        userId: id,
        controlLevel,
        isActive,
        notes,
        modifiedById: req.agent.id
      });
    }

    createAuditLog({
      action: 'winloss_control_updated',
      performedBy: req.agent.id,
      performedByModel: 'Agent',
      targetUser: id,
      newData: { controlLevel, isActive, notes }
    });

    res.json({ success: true, message: 'Updated', winLossControl: ctrl });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};



exports.getAllTrades = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all', orderNo, userId, symbol } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status !== 'all') where.status = status;
    if (orderNo) where.orderNo = { [Op.like]: `%${orderNo}%` };
    if (userId) where.userId = userId;
    if (symbol) where.pair = { [Op.like]: `%${symbol}%` };

    if (req.agent.role === 'agent') {
      // Filter by assigned users
      // Subquery or IN clause. 
      const assignedUsers = await User.findAll({ where: { assignedAgentId: req.agent.id }, attributes: ['id'] });
      const ids = assignedUsers.map(u => u.id);
      if (where.userId) {
        if (!ids.includes(where.userId)) where.userId = null;
      } else {
        where.userId = { [Op.in]: ids };
      }
    }

    const { count, rows } = await Trade.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['username', 'email', 'isSimulated'],
        include: [{ model: WinLossControl, as: 'winLossControl' }]
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      trades: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
};

exports.getUserWallets = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (req.agent.role === 'agent' && user.assignedAgentId !== req.agent.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const cards = await BankCard.findAll({ where: { userId: userId }, order: [['createdAt', 'DESC']] });
    const cryptos = await CryptoWallet.findAll({ where: { userId: userId }, order: [['createdAt', 'DESC']] });

    res.json({ success: true, bankCards: cards, cryptoWallets: cryptos });
  } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
};

// Wallets
exports.getMyWallets = async (req, res) => {
  try {
    const cards = await BankCard.findAll({ where: { agentId: req.agent.id, status: 'active' }, order: [['createdAt', 'DESC']] });
    const cryptos = await CryptoWallet.findAll({ where: { agentId: req.agent.id, status: 'active' }, order: [['createdAt', 'DESC']] });
    res.json({ success: true, bankCards: cards, cryptoWallets: cryptos });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.addMyBankCard = async (req, res) => {
  try {
    const card = await BankCard.create({ ...req.body, agentId: req.agent.id, userId: null, status: 'active' });
    res.status(201).json({ success: true, bankCard: card });
  } catch (e) {
    console.error('Add bank card error:', e);
    res.status(500).json({ success: false, message: e.message || 'Failed to add bank card' });
  }
};

exports.addMyCryptoWallet = async (req, res) => {
  try {
    const wallet = await CryptoWallet.create({ ...req.body, agentId: req.agent.id, userId: null, status: 'active' });
    res.status(201).json({ success: true, cryptoWallet: wallet });
  } catch (e) {
    console.error('Add crypto wallet error:', e);
    res.status(500).json({ success: false, message: e.message || 'Failed to add crypto wallet' });
  }
};

exports.deleteMyBankCard = async (req, res) => {
  try {
    await BankCard.update({ status: 'inactive' }, { where: { id: req.params.id, agentId: req.agent.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
};

exports.deleteMyCryptoWallet = async (req, res) => {
  try {
    await CryptoWallet.update({ status: 'inactive' }, { where: { id: req.params.id, agentId: req.agent.id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false }); }
};