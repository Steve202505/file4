'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/database.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Import Models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Agent = require('./Agent')(sequelize, Sequelize.DataTypes);
const AgentAssignedUser = require('./AgentAssignedUser')(sequelize, Sequelize.DataTypes);
const AgentPermission = require('./AgentPermission')(sequelize, Sequelize.DataTypes);
const Trade = require('./Trade')(sequelize, Sequelize.DataTypes);
const Transaction = require('./Transaction')(sequelize, Sequelize.DataTypes);
const Withdrawal = require('./Withdrawal')(sequelize, Sequelize.DataTypes);
const BankCard = require('./BankCard')(sequelize, Sequelize.DataTypes);
const CryptoWallet = require('./CryptoWallet')(sequelize, Sequelize.DataTypes);
const WinLossControl = require('./WinLossControl')(sequelize, Sequelize.DataTypes);
const AuditLog = require('./AuditLog')(sequelize, Sequelize.DataTypes);
const GlobalSettings = require('./GlobalSettings')(sequelize, Sequelize.DataTypes);

db.User = User;
db.Agent = Agent;
db.AgentAssignedUser = AgentAssignedUser;
db.AgentPermission = AgentPermission;
db.Trade = Trade;
db.Transaction = Transaction;
db.Withdrawal = Withdrawal;
db.BankCard = BankCard;
db.CryptoWallet = CryptoWallet;
db.WinLossControl = WinLossControl;
db.AuditLog = AuditLog;
db.GlobalSettings = GlobalSettings;

// Initialize associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
