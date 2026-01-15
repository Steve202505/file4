const { Agent, sequelize } = require('./src/models');
const { generateReferCode } = require('./src/utils/helpers');
require('dotenv').config();

async function createAdmin() {
  try {
    // Wait for connection
    await sequelize.authenticate();
    console.log('Connected to MySQL...');

    const username = process.env.ADMIN_USERNAME || 'superadmin';
    const password = 'admin123'; // Default password

    // Check if exists
    const existing = await Agent.findOne({ where: { username } });
    if (existing) {
      console.log('⚠️ Admin user already exists.');
      console.log(`👤 Username: ${username}`);
      console.log('If you process forgot the password, please manually update it in DB or use a reset script.');
      process.exit(0);
    }

    // Create
    const admin = await Agent.create({
      username,
      password, // Model hook will hash
      role: 'admin',
      isActive: true,
      referCode: generateReferCode()
    });

    console.log('✅ Admin user created successfully!');
    console.log(`👤 Username: ${username}`);
    console.log(`🔑 Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();