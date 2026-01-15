const { User, Agent, Transaction, AgentAssignedUser, WinLossControl, GlobalSettings, sequelize } = require('./src/models');
const { generateReferCode } = require('./src/utils/helpers');

async function seedDatabase() {
  try {
    console.log('🚀 Starting Database Seeding...');

    // Wait for connection
    await sequelize.authenticate();
    console.log('✅ Connected to Database');

    // Force sync (CAUTION: deletes data!)
    // await sequelize.sync({ force: true });
    // Instead of force sync, just delete specifically if needed
    // But for a clean seeder, force sync is often used in dev
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await User.destroy({ where: {}, truncate: { cascade: true } });
    await Agent.destroy({ where: {}, truncate: { cascade: true } });
    await WinLossControl.destroy({ where: {}, truncate: { cascade: true } });
    await Transaction.destroy({ where: {}, truncate: { cascade: true } });
    await AgentAssignedUser.destroy({ where: {} });
    await GlobalSettings.destroy({ where: {}, truncate: { cascade: true } });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('🗑️  Cleared existing data');

    // 1. Create Global Settings
    await GlobalSettings.create({
      globalSupportMessage: 'Welcome to the Majestic Trading Platform. If you need help, please contact our 24/7 support.'
    });
    console.log('✅ Global Settings initialized');

    // 2. Create Admin User
    const admin = await Agent.create({
      username: 'superadmin',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      referCode: 'ADMIN001'
    });
    console.log('✅ Admin created:', admin.username);

    // 3. Create Regular Agent
    const agent1 = await Agent.create({
      username: 'agent1',
      password: 'agent123',
      role: 'agent',
      isActive: true,
      referCode: 'AGENT001'
    });
    console.log('✅ Agent created:', agent1.username);

    // 4. Create Test User
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      mobileNumber: '1234567890',
      password: 'user123',
      referCode: 'REF12345',
      accountBalance: 1000,
      isActive: true,
      assignedAgentId: agent1.id
    });
    console.log('✅ User created:', user.username);

    // Update AgentAssignedUser junction
    await AgentAssignedUser.create({ agentId: agent1.id, userId: user.id });

    // 5. Create More Test Users
    const testUsers = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        mobileNumber: '1112223333',
        password: 'password123',
        accountBalance: 500,
        referCode: 'JOHN123'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        mobileNumber: '4445556666',
        password: 'password123',
        accountBalance: 1500,
        referCode: 'JANE456'
      }
    ];

    for (const userData of testUsers) {
      const newUser = await User.create({
        ...userData,
        isActive: true,
        assignedAgentId: agent1.id
      });
      await AgentAssignedUser.create({ agentId: agent1.id, userId: newUser.id });
      console.log(`✅ User created: ${userData.username}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 TEST CREDENTIALS:');
    console.log('═'.repeat(40));
    console.log('ADMIN PANEL (http://localhost:3001)');
    console.log('  Username: superadmin');
    console.log('  Password: admin123');
    console.log('\nAGENT PANEL (http://localhost:3001)');
    console.log('  Username: agent1');
    console.log('  Password: agent123');
    console.log('\nUSER WEBSITE (http://localhost:3000)');
    console.log('  Username: testuser (or test@example.com)');
    console.log('  Password: user123');
    console.log('═'.repeat(40));
    console.log('\n🌐 APPLICATION URLs:');
    console.log('  User Website:  http://localhost:3000');
    console.log('  Agent Panel:   http://localhost:3001');
    console.log('  Backend API:   http://localhost:5000');
    console.log('═'.repeat(40));

    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();