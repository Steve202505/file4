const mongoose = require('mongoose');
const Trade = require('../src/models/Trade');
const User = require('../src/models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
};

const generateTrades = async () => {
    await connectDB();

    try {
        const user = await User.findOne({ username: 'testuser' });
        if (!user) {
            console.error('Test user not found');
            process.exit(1);
        }

        console.log(`Generating trades for user: ${user.username} (${user._id})`);

        const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT'];
        const types = ['buy', 'sell'];
        const statuses = ['won', 'lost', 'pending'];

        const trades = [];

        for (let i = 0; i < 25; i++) {
            const now = new Date();
            // Create timestamps in the past
            const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 10000000));

            const timestamp = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0') +
                now.getHours().toString().padStart(2, '0') +
                now.getMinutes().toString().padStart(2, '0') +
                now.getSeconds().toString().padStart(2, '0');
            const orderNo = `${timestamp}${Math.floor(100000 + Math.random() * 900000)}`;

            const pair = pairs[Math.floor(Math.random() * pairs.length)];
            const type = types[Math.floor(Math.random() * types.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const amount = Math.floor(Math.random() * 1000) + 10;
            const entryPrice = Math.random() * 50000 + 1000;
            const exitPrice = status === 'won' ? entryPrice * 1.05 : (status === 'lost' ? entryPrice * 0.95 : null);
            const pnl = status === 'won' ? amount * 0.9 : (status === 'lost' ? -amount : 0);
            const resolveAt = status === 'pending' ? new Date(now.getTime() + 60000) : createdAt;

            trades.push({
                userId: user._id,
                pair,
                type,
                amount,
                entryPrice,
                exitPrice,
                status,
                pnl,
                duration: 60,
                orderNo,
                leverage: Math.floor(Math.random() * 10) + 1,
                profitRate: 90,
                createdAt,
                resolveAt
            });
        }

        await Trade.insertMany(trades);
        console.log('Successfully generated 25 test trades');
    } catch (error) {
        console.error('Error generating trades:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

generateTrades();
