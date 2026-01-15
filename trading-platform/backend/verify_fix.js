const { Transaction, User, sequelize, Sequelize } = require('./src/models');
const { withLockingTransaction } = require('./src/utils/sequelizeTransactionWrapper');

async function testFix() {
    try {
        console.log('Testing Balance Adjustment logic with Transaction Wrapper...');

        const user = await User.findOne();
        if (!user) {
            console.error('No user found in database to test with.');
            return;
        }

        console.log(`Using user: ${user.username} (${user.id})`);

        const result = await withLockingTransaction(async (t) => {
            const oldBalance = parseFloat(user.accountBalance);
            const adjustment = 100;

            await user.increment('accountBalance', { by: adjustment, transaction: t });
            const newBalance = oldBalance + adjustment;

            await Transaction.create({
                userId: user.id,
                type: 'adjustment',
                amount: adjustment,
                oldBalance: oldBalance,
                newBalance: newBalance,
                status: 'completed',
                description: 'Verification Test Success'
            }, { transaction: t });

            return newBalance;
        });

        console.log('Balance adjustment simulation successful!');
        console.log('New Balance:', result);

    } catch (error) {
        console.error('Verification failed:');
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

testFix();
