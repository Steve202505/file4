const mongoose = require('mongoose');
const Agent = require('../src/models/Agent');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

const grantPermissions = async () => {
    await connectDB();

    try {
        const permissions = [
            'view_users', 'edit_users', 'delete_users',
            'view_trades',
            'view_withdrawals', 'edit_withdrawals',
            'manage_winloss',
            'view_agents', 'create_agents', 'edit_agents', 'delete_agents',
            'view_audit_logs'
        ];

        const result = await Agent.updateMany(
            {},
            { $addToSet: { permissions: { $each: permissions } } }
        );

        console.log(`Updated permissions for ${result.modifiedCount} agents.`);

        // specifically verify agent1
        const agent = await Agent.findOne({ username: 'agent1' });
        if (agent) {
            console.log('Agent1 permissions:', agent.permissions);
        }

    } catch (error) {
        console.error('Error updating permissions:', error);
    } finally {
        mongoose.connection.close();
    }
};

grantPermissions();
