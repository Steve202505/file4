const { Withdrawal, User, Transaction, Agent, sequelize } = require('../models');
const { createAuditLog, getClientIp } = require('../utils/helpers');
const { withLockingTransaction } = require('../utils/sequelizeTransactionWrapper');
const { Op } = require('sequelize');

exports.getAllWithdrawals = async (req, res) => {
    try {
        const { page = 1, limit = 20, status = 'all', orderNumber, username, userId } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (status !== 'all') where.status = status;
        if (orderNumber) where.orderNumber = { [Op.like]: `%${orderNumber}%` };
        if (userId) where.userId = userId;

        const include = [{ model: User, attributes: ['username', 'email', 'mobileNumber'] }];

        // Username filter requires internal join or pre-fetch
        if (username) {
            include[0].where = { username: { [Op.like]: `%${username}%` } };
            include[0].required = true;
        }

        // Agent restriction
        if (req.agent.role === 'agent') {
            const assignedUsers = await User.findAll({
                where: { assignedAgentId: req.agent.id },
                attributes: ['id']
            });
            const ids = assignedUsers.map(u => u.id);

            if (where.userId) {
                if (!ids.includes(where.userId)) where.userId = null;
            } else {
                where.userId = { [Op.in]: ids };
            }
        }

        const { count, rows } = await Withdrawal.findAndCountAll({
            where,
            include,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            withdrawals: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        console.error('Get withdrawals error:', error);
        res.status(500).json({ success: false, message: 'Error fetching withdrawals' });
    }
};

exports.reviewWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const result = await withLockingTransaction(async (t) => {
            const withdrawal = await Withdrawal.findByPk(id, { transaction: t, lock: true, include: [User] });
            if (!withdrawal) throw { status: 404, message: 'Not found' };
            if (withdrawal.status !== 'pending') throw { status: 400, message: 'Already reviewed' };

            // Permission check
            if (req.agent.role === 'agent') {
                if (withdrawal.User.assignedAgentId !== req.agent.id) {
                    throw { status: 403, message: 'Access denied' };
                }
            }

            withdrawal.status = status;
            withdrawal.reviewedById = req.agent.id;
            withdrawal.reviewNotes = notes;
            withdrawal.reviewedAt = new Date();
            await withdrawal.save({ transaction: t });

            if (withdrawal.transactionId) {
                const txn = await Transaction.findByPk(withdrawal.transactionId, { transaction: t, lock: true });
                if (txn) {
                    txn.status = status === 'approved' ? 'completed' : 'rejected';
                    txn.description += ` (Reviewed by ${req.agent.username})`;
                    await txn.save({ transaction: t });
                }
            }

            if (status === 'rejected') {
                // Refund
                const user = await User.findByPk(withdrawal.userId, { transaction: t, lock: true });

                const amount = parseFloat(withdrawal.amount);
                const oldBalance = parseFloat(user.accountBalance);

                await user.increment('accountBalance', { by: amount, transaction: t });
                const newBalance = oldBalance + amount;

                await Transaction.create({
                    userId: user.id,
                    type: 'adjustment',
                    amount: amount,
                    oldBalance: oldBalance,
                    newBalance: newBalance,
                    status: 'completed',
                    description: `Withdrawal refund: ${notes || 'Rejected'}`,
                    reference: `REF-${Date.now()}`,
                    performedById: req.agent.id
                }, { transaction: t });
            }

            return withdrawal;
        });

        createAuditLog({
            action: `withdrawal_${status}`,
            performedBy: req.agent.id,
            performedByModel: 'Agent',
            targetUser: result.userId,
            newData: { status, notes },
            ipAddress: getClientIp(req),
            userAgent: req.headers['user-agent']
        });

        res.json({ success: true, message: `Withdrawal ${status}`, withdrawal: result });

    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({ success: false, message: error.message || 'Error' });
    }
};
