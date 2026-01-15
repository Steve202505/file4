const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const {
    User, Agent, Trade, Transaction,
    WinLossControl, BankCard, CryptoWallet,
    AgentAssignedUser, sequelize
} = require('../src/models');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// MongoDB Schemas (Minimal for reading)
const userSchema = new mongoose.Schema({}, { strict: false });
const agentSchema = new mongoose.Schema({}, { strict: false });
const tradeSchema = new mongoose.Schema({}, { strict: false });
const transactionSchema = new mongoose.Schema({}, { strict: false });
const winLossSchema = new mongoose.Schema({}, { strict: false });
const bankCardSchema = new mongoose.Schema({}, { strict: false });
const cryptoWalletSchema = new mongoose.Schema({}, { strict: false });

const MongoUser = mongoose.model('User', userSchema);
const MongoAgent = mongoose.model('Agent', agentSchema);
const MongoTrade = mongoose.model('Trade', tradeSchema);
const MongoTransaction = mongoose.model('Transaction', transactionSchema);
const MongoWinLoss = mongoose.model('WinLossControl', winLossSchema, 'winlosscontrols');
const MongoBankCard = mongoose.model('BankCard', bankCardSchema);
const MongoCryptoWallet = mongoose.model('CryptoWallet', cryptoWalletSchema);

async function migrate() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🔄 Connecting to MySQL...');
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL');

        // 1. Migrate Agents
        console.log('🚀 Migrating Agents...');
        const mongoAgents = await MongoAgent.find().lean();
        for (const ma of mongoAgents) {
            const existsById = await Agent.findByPk(ma._id.toString());
            const existsByUsername = await Agent.findOne({ where: { username: ma.username } });

            if (!existsById && !existsByUsername) {
                await Agent.create({
                    id: ma._id.toString(),
                    username: ma.username,
                    password: ma.password, // Already hashed
                    role: ma.role,
                    is_active: ma.isActive !== undefined ? ma.isActive : true,
                    locale: ma.locale || 'en',
                    refer_code: ma.referCode || null,
                    created_at: ma.createdAt || new Date(),
                    updated_at: ma.updatedAt || new Date()
                }, { hooks: false });

                if (ma.permissions && Array.isArray(ma.permissions)) {
                    const perms = ma.permissions.map(p => ({
                        agent_id: ma._id.toString(),
                        permission: p
                    }));
                    const { AgentPermission } = require('../src/models');
                    if (perms.length > 0) {
                        await AgentPermission.bulkCreate(perms);
                    }
                }
            } else {
                console.log(`Skipping Agent ${ma.username} (already exists)`);
            }
        }
        console.log(`✅ Migrated Agents processing complete`);

        // 2. Migrate Users
        console.log('🚀 Migrating Users...');
        const mongoUsers = await MongoUser.find().lean();
        for (const mu of mongoUsers) {
            const existsById = await User.findByPk(mu._id.toString());
            const existsByEmail = await User.findOne({ where: { email: mu.email } });
            const existsByUsername = await User.findOne({ where: { username: mu.username } });

            if (!existsById && !existsByEmail && !existsByUsername) {
                await User.create({
                    id: mu._id.toString(),
                    username: mu.username,
                    email: mu.email,
                    mobile_number: mu.mobileNumber,
                    password: mu.password,
                    transaction_password: mu.transactionPassword,
                    wallet_address: mu.walletAddress,
                    credit_score: mu.creditScore,
                    vip_level: mu.vipLevel,
                    is_simulated: mu.isSimulated || false,
                    refer_code: mu.referCode,
                    referred_by_id: mu.referredBy ? mu.referredBy.toString() : null,
                    account_balance: mu.accountBalance || 0,
                    role: mu.role || 'user',
                    is_active: mu.isActive !== undefined ? mu.isActive : true,
                    locale: mu.locale || 'en',
                    assigned_agent_id: mu.assignedAgent ? mu.assignedAgent.toString() : null,
                    support_message: mu.supportMessage,
                    created_at: mu.createdAt || new Date(),
                    updated_at: mu.updatedAt || new Date()
                }, { hooks: false });

                if (mu.assignedAgent) {
                    await AgentAssignedUser.findOrCreate({
                        where: {
                            agent_id: mu.assignedAgent.toString(),
                            user_id: mu._id.toString()
                        },
                        defaults: {
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    });
                }
            } else {
                console.log(`Skipping User ${mu.username} (already exists)`);
            }
        }
        console.log(`✅ Migrated Users processing complete`);

        // 3. Migrate WinLossControl
        console.log('🚀 Migrating WinLoss Controls...');
        const mongoWinLoss = await MongoWinLoss.find().lean();
        for (const mw of mongoWinLoss) {
            if (!mw.user) continue;
            const existing = await WinLossControl.findOne({ where: { user_id: mw.user.toString() } });
            if (!existing) {
                // Verify user exists first to respect FK
                const userExists = await User.findByPk(mw.user.toString());
                if (userExists) {
                    await WinLossControl.create({
                        user_id: mw.user.toString(),
                        control_level: mw.controlLevel || 'none',
                        is_active: mw.isActive !== undefined ? mw.isActive : true,
                        notes: mw.notes,
                        modified_by_id: mw.modifiedBy ? mw.modifiedBy.toString() : null,
                        created_at: mw.createdAt || new Date(),
                        updated_at: mw.updatedAt || new Date()
                    });
                }
            }
        }

        // 4. Migrate Bank Cards
        console.log('🚀 Migrating Bank Cards...');
        const mongoCards = await MongoBankCard.find().lean();
        for (const mc of mongoCards) {
            if (!mc.user) continue;
            const exists = await BankCard.findByPk(mc._id.toString());
            if (!exists) {
                const userExists = await User.findByPk(mc.user.toString());
                if (userExists) {
                    await BankCard.create({
                        id: mc._id.toString(),
                        user_id: mc.user.toString(),
                        bank_name: mc.bankName,
                        account_name: mc.accountName,
                        account_number: mc.accountNumber,
                        branch_name: mc.branchName,
                        ifsc_code: mc.ifscCode,
                        status: mc.status || 'active',
                        created_at: mc.createdAt || new Date(),
                        updated_at: mc.updatedAt || new Date()
                    });
                }
            }
        }

        // 5. Migrate Crypto Wallets
        console.log('🚀 Migrating Crypto Wallets...');
        const mongoWallets = await MongoCryptoWallet.find().lean();
        for (const mw of mongoWallets) {
            if (!mw.user) continue;
            const exists = await CryptoWallet.findByPk(mw._id.toString());
            if (!exists) {
                const userExists = await User.findByPk(mw.user.toString());
                if (userExists) {
                    await CryptoWallet.create({
                        id: mw._id.toString(),
                        user_id: mw.user.toString(),
                        network: mw.network,
                        wallet_address: mw.walletAddress,
                        label: mw.label,
                        status: mw.status || 'active',
                        created_at: mw.createdAt || new Date(),
                        updated_at: mw.updatedAt || new Date()
                    });
                }
            }
        }

        // 6. Migrate Trades
        console.log('🚀 Migrating Trades...');
        const mongoTrades = await MongoTrade.find().lean();
        for (const mt of mongoTrades) {
            if (!mt.user) continue;
            const exists = await Trade.findByPk(mt._id.toString());
            if (!exists) {
                const userExists = await User.findByPk(mt.user.toString());
                if (userExists) {
                    await Trade.create({
                        id: mt._id.toString(),
                        user_id: mt.user.toString(),
                        pair: mt.pair,
                        amount: mt.amount,
                        entry_price: mt.entryPrice,
                        exit_price: mt.exitPrice,
                        type: mt.direction,
                        status: mt.status,
                        pnl: mt.pnl,
                        duration: mt.duration,
                        order_no: mt.orderNumber,
                        leverage: 1,
                        profit_rate: mt.profitPercentage || 0,
                        resolve_at: mt.resolveTime || new Date(),
                        is_win: mt.forceWin !== undefined ? mt.forceWin : false,
                        created_at: mt.createdAt || new Date(),
                        updated_at: mt.updatedAt || new Date()
                    });
                }
            }
        }

        // 7. Migrate Transactions
        console.log('🚀 Migrating Transactions...');
        const mongoTrans = await MongoTransaction.find().lean();
        for (const mt of mongoTrans) {
            if (!mt.user) continue;
            const exists = await Transaction.findByPk(mt._id.toString());
            if (!exists) {
                const userExists = await User.findByPk(mt.user.toString());
                if (userExists) {
                    await Transaction.create({
                        id: mt._id.toString(),
                        user_id: mt.user.toString(),
                        type: mt.type,
                        amount: mt.amount,
                        old_balance: mt.oldBalance || 0,
                        new_balance: mt.newBalance || 0,
                        status: mt.status,
                        description: mt.description,
                        performed_by_id: mt.performedBy ? mt.performedBy.toString() : null,
                        created_at: mt.createdAt || new Date(),
                        updated_at: mt.updatedAt || new Date()
                    });
                }
            }
        }

        console.log('✅ Migration Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration Error:', error);
        process.exit(1);
    }
}

migrate();
