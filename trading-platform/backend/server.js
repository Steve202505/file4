const app = require('./src/app');
const { sequelize } = require('./src/models');
const { recoverTrades } = require('./src/controllers/tradeController');

const PORT = process.env.PORT || 5000;

// Connect to MySQL/Sequelize
sequelize.authenticate()
  .then(async () => {
    console.log('Database connected successfully.');

    // Recover and resolve any trades that expired while server was offline
    try {
      await recoverTrades();
    } catch (err) {
      console.error('Error recovering trades:', err);
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });