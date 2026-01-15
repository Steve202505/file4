const { Trade, User, Transaction, WinLossControl, sequelize } = require('../models');
const { createAuditLog, getClientIp } = require('../utils/helpers');
const { withTransaction, withLockingTransaction } = require('../utils/sequelizeTransactionWrapper');
const { Op } = require('sequelize');

// Place a trade
exports.placeTrade = async (req, res) => {
    try {
        const { pair, type, amount, entryPrice, duration = 60 } = req.body;
        const userId = req.user.id; // Sequelize uses 'id', not '_id'

        const result = await withLockingTransaction(async (t) => {
            const user = await User.findByPk(userId, { transaction: t, lock: true });
            if (!user) {
                throw { status: 404, message: 'User not found' };
            }

            if (amount <= 0) {
                throw { status: 400, message: 'Invalid trade amount' };
            }

            if (parseFloat(user.accountBalance) < parseFloat(amount)) {
                throw { status: 400, message: 'Insufficient balance' };
            }

            const oldBalance = parseFloat(user.accountBalance);

            // Deduct balance
            await user.decrement('accountBalance', { by: amount, transaction: t });
            // Reload user to get new balance just to be sure, or calc
            const newBalance = oldBalance - parseFloat(amount);

            // Generate numeric orderNo
            const now = new Date();
            const timestamp = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0') +
                now.getHours().toString().padStart(2, '0') +
                now.getMinutes().toString().padStart(2, '0') +
                now.getSeconds().toString().padStart(2, '0');
            const orderNo = `${timestamp}${Math.floor(1000 + Math.random() * 9000)}`;

            const resolveAt = new Date(Date.now() + duration * 1000);

            const trade = await Trade.create({
                userId: userId,
                pair,
                type,
                amount,
                entryPrice: entryPrice,
                duration,
                orderNo: orderNo,
                leverage: req.body.leverage || 1,
                profitRate: req.body.profitRate || 90,
                status: 'pending',
                resolveAt: resolveAt
            }, { transaction: t });

            // Create transaction log
            await Transaction.create({
                userId: userId,
                type: 'trade',
                amount: -amount,
                oldBalance: oldBalance,
                newBalance: newBalance,
                status: 'completed',
                description: `Placed ${type} trade on ${pair}`,
                reference: `TRD-${orderNo}`
            }, { transaction: t });

            // Audit log (inside helper won't use transaction, but that's fine)
            // Ideally we'd wrap audit log creation too but it's okay to fail silently or be non-blocking

            return { trade, remainingBalance: newBalance };
        });

        // Decide result and schedule resolution
        // The rest of this function is logic outside the main DB transaction to calculate win/loss
        const control = await WinLossControl.findOne({ where: { userId: userId, isActive: true } });
        let winProbability = 0.5;
        if (control) {
            switch (control.controlLevel) {
                case 'high': winProbability = 0.9; break;
                case 'medium': winProbability = 0.7; break;
                case 'low': winProbability = 0.3; break;
                case 'none': winProbability = 0.5; break;
            }
        }

        const isWin = Math.random() < winProbability;

        // Update trade with pre-calculated result
        // We do this in a separate small update, or could have done in main txn if we calculated before
        // But doing it here maps to original logic
        result.trade.isWin = isWin;
        result.trade.targetPrice = isWin
            ? (type === 'buy' ? entryPrice + (entryPrice * 0.001) : entryPrice - (entryPrice * 0.001))
            : (type === 'buy' ? entryPrice - (entryPrice * 0.001) : entryPrice + (entryPrice * 0.001));

        await result.trade.save();

        // Create Audit Log non-blocking
        createAuditLog({
            action: 'trade_placed',
            performedBy: userId,
            performedByModel: 'User',
            targetUser: userId,
            newData: { tradeId: result.trade.id, amount, pair, type },
            ipAddress: getClientIp(req),
            userAgent: req.headers['user-agent']
        });

        setTimeout(async () => {
            // In distributed system, use job queue. Here using setTimeout as per original
            await resolveTrade(result.trade.id);
        }, duration * 1000);

        res.status(201).json({
            success: true,
            message: 'Trade placed successfully',
            trade: result.trade,
            remainingBalance: result.remainingBalance
        });

    } catch (error) {
        console.error('Place trade error:', error);
        const status = error.status || 500;
        const message = error.message || 'Internal server error';
        res.status(status).json({ success: false, message });
    }
};

// Helper to resolve a trade
async function resolveTrade(tradeId) {
    try {
        await withLockingTransaction(async (t) => {
            const trade = await Trade.findByPk(tradeId, { transaction: t, lock: true });

            if (!trade || trade.status !== 'pending') {
                return;
            }

            const user = await User.findByPk(trade.userId, { transaction: t, lock: true });
            if (!user) {
                return;
            }

            // Use stored isWin value
            let isWin = trade.isWin;

            if (isWin === undefined || isWin === null) {
                // Fallback logic
                const control = await WinLossControl.findOne({
                    where: { userId: trade.userId, isActive: true },
                    transaction: t
                });
                let winProb = 0.5;
                if (control) {
                    if (control.controlLevel === 'high') winProb = 0.9;
                    else if (control.controlLevel === 'medium') winProb = 0.7;
                    else if (control.controlLevel === 'low') winProb = 0.3;
                }
                isWin = Math.random() < winProb;
            }

            const oldBalance = parseFloat(user.accountBalance);
            let newBalance = oldBalance;

            if (isWin) {
                const profitSize = parseFloat(trade.profitRate) / 100;
                const profit = parseFloat(trade.amount) * profitSize;
                const totalReturn = parseFloat(trade.amount) + profit;

                trade.status = 'won';
                trade.pnl = profit;
                trade.exitPrice = trade.targetPrice || (trade.entryPrice + (trade.entryPrice * 0.001));

                // Add back stake + profit
                await user.increment('accountBalance', { by: totalReturn, transaction: t });
                newBalance = oldBalance + totalReturn;

                await Transaction.create({
                    userId: user.id,
                    type: 'trade_win',
                    amount: totalReturn,
                    oldBalance: oldBalance,
                    newBalance: newBalance,
                    status: 'completed',
                    description: `Trade Won: ${trade.pair} ${trade.type} (Stake + Profit returned)`,
                    reference: `WIN-${trade.orderNo}`
                }, { transaction: t });

                createAuditLog({
                    action: 'trade_won',
                    performedBy: user.id,
                    performedByModel: 'User',
                    targetUser: user.id,
                    newData: { tradeId, profit, amount: trade.amount },
                    ipAddress: 'system'
                });
            } else {
                trade.status = 'lost';
                trade.pnl = -parseFloat(trade.amount);
                trade.exitPrice = trade.targetPrice || (trade.entryPrice - (trade.entryPrice * 0.001));

                // Balance was already deducted at placement

                await Transaction.create({
                    userId: user.id,
                    type: 'trade_loss',
                    amount: -parseFloat(trade.amount),
                    oldBalance: oldBalance,
                    newBalance: oldBalance,
                    status: 'completed',
                    description: `Trade Lost: ${trade.pair} ${trade.type}`,
                    reference: `LOS-${trade.orderNo}`
                }, { transaction: t });

                createAuditLog({
                    action: 'trade_loss',
                    performedBy: user.id,
                    performedByModel: 'User',
                    targetUser: user.id,
                    newData: { tradeId, loss: trade.amount },
                    ipAddress: 'system'
                });
            }

            await trade.save({ transaction: t });
        });
    } catch (err) {
        console.error('Trade resolution error:', err);
    }
}

// Recover trades
exports.recoverTrades = async () => {
    try {
        const expiredTrades = await Trade.findAll({
            where: {
                status: 'pending',
                resolveAt: { [Op.lte]: new Date() }
            }
        });

        console.log(`Recovering ${expiredTrades.length} trades...`);
        for (const trade of expiredTrades) {
            await resolveTrade(trade.id);
        }
    } catch (err) {
        console.error('Trade recovery error:', err);
    }
};

// Get trade history
exports.getTradeHistory = async (req, res) => {
    try {
        const trades = await Trade.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, trades });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching trades' });
    }
};
