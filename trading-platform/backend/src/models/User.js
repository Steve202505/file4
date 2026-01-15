'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Self-referential (Referrals)
      User.belongsTo(models.User, { as: 'referrer', foreignKey: 'referredById' });
      User.hasMany(models.User, { as: 'referrals', foreignKey: 'referredById' });

      // Agent Assignment
      User.belongsTo(models.Agent, { as: 'assignedAgent', foreignKey: 'assignedAgentId' });
      User.belongsToMany(models.Agent, {
        through: models.AgentAssignedUser,
        as: 'managingAgents',
        foreignKey: 'userId',
        otherKey: 'agentId'
      });

      // Trade & Transaction
      User.hasMany(models.Trade, { as: 'trades', foreignKey: 'userId' });
      User.hasMany(models.Transaction, { as: 'transactions', foreignKey: 'userId' });

      // Financial
      User.hasMany(models.Withdrawal, { as: 'withdrawals', foreignKey: 'userId' });
      User.hasMany(models.BankCard, { as: 'bankCards', foreignKey: 'userId' });
      User.hasMany(models.CryptoWallet, { as: 'cryptoWallets', foreignKey: 'userId' });

      // Control & Audit
      User.hasOne(models.WinLossControl, { as: 'winLossControl', foreignKey: 'userId' });
      User.hasMany(models.AuditLog, { as: 'targetedLogs', foreignKey: 'targetUserId' });
    }

    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }

    async compareTransactionPassword(candidatePassword) {
      if (!this.transactionPassword) return false;
      return bcrypt.compare(candidatePassword, this.transactionPassword);
    }
  }

  User.init({
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase());
      }
    },
    mobileNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        is: /^[0-9]{10,15}$/
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    transactionPassword: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    walletAddress: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    creditScore: {
      type: DataTypes.TINYINT.UNSIGNED,
      defaultValue: 0,
      validate: { max: 100 }
    },
    vipLevel: {
      type: DataTypes.TINYINT.UNSIGNED,
      defaultValue: 0
    },
    isSimulated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    referCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true
    },
    referredById: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    accountBalance: {
      type: DataTypes.DECIMAL(20, 8),
      defaultValue: 1000.00000000,
      validate: { min: 0 },
      get() {
        const value = this.getDataValue('accountBalance');
        return value === null ? null : parseFloat(value);
      }
    },
    role: {
      type: DataTypes.ENUM('user'),
      defaultValue: 'user'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    locale: {
      type: DataTypes.ENUM('en', 'zh', 'ar', 'bn', 'hi', 'ur', 'ru', 'uk', 'fr', 'km'),
      defaultValue: 'en'
    },
    assignedAgentId: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    supportMessage: {
      type: DataTypes.TEXT,
      defaultValue: ''
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    indexes: [
      { name: 'idx_users_email_username_active', fields: ['email', 'username', 'is_active'] }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        if (user.transactionPassword) {
          user.transactionPassword = await bcrypt.hash(user.transactionPassword, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
        if (user.changed('transactionPassword')) {
          user.transactionPassword = await bcrypt.hash(user.transactionPassword, 10);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password', 'transactionPassword'] }
    },
    scopes: {
      withPassword: { attributes: { include: ['password'] } },
      withTransactionPassword: { attributes: { include: ['transactionPassword'] } }
    }
  });

  return User;
};