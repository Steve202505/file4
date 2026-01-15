const { Agent, sequelize } = require('./src/models');
const { generateReferCode } = require('./src/utils/helpers');

async function testAgentCreation() {
    try {
        console.log('Testing Agent Creation logic...');

        const username = `testagent_${Date.now().toString().slice(-6)}`;
        const password = 'password123';
        const role = 'agent';
        const referCode = generateReferCode();

        const agent = await Agent.create({
            username,
            password,
            role,
            isActive: true,
            referCode: referCode
        });

        console.log('Agent created successfully!');
        console.log('Agent ID:', agent.id);
        console.log('Username:', agent.username);
        console.log('Refer Code:', agent.referCode);

        // Cleanup
        await agent.destroy();
        console.log('Test agent cleaned up.');

    } catch (error) {
        console.error('Verification failed:');
        console.error(error);
    } finally {
        await sequelize.close();
    }
}

testAgentCreation();
