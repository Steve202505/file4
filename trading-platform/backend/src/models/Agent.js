'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Agent extends Model {
    static associate(models) {
      Agent.hasMany(models.User, { as: 'directlyAssignedUsers', foreignKey: 'assignedAgentId' });
      Agent.belongsToMany(models.User, {
        through: models.AgentAssignedUser,
        as: 'assignedUsers',
        foreignKey: 'agentId',
        otherKey: 'userId'
      });
      Agent.hasMany(models.AgentPermission, { as: 'permissions', foreignKey: 'agentId' });

      Agent.hasMany(models.Transaction, { as: 'performedTransactions', foreignKey: 'performedById' });
      Agent.hasMany(models.Withdrawal, { as: 'reviewedWithdrawals', foreignKey: 'reviewedById' });
      Agent.hasMany(models.WinLossControl, { as: 'modifiedControls', foreignKey: 'modifiedById' });
      Agent.hasMany(models.AuditLog, { as: 'targetedAgentLogs', foreignKey: 'targetAgentId' });
    }

    async comparePassword(candidatePassword) {
      return bcrypt.compare(candidatePassword, this.password);
    }

    static getDefaultPermissions(role) {
      if (role === 'admin') {
        return ['view_users', 'edit_users', 'manage_winloss', 'delete_users', 'view_withdrawals', 'edit_withdrawals', 'view_trades'];
      }
      return ['view_users', 'edit_users', 'manage_winloss', 'view_withdrawals', 'edit_withdrawals', 'view_trades'];
    }
  }

  Agent.init({
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('agent', 'admin'),
      defaultValue: 'agent'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    locale: {
      type: DataTypes.ENUM('en', 'zh', 'ar', 'bn', 'hi', 'ur', 'ru', 'uk', 'fr', 'km'),
      defaultValue: 'en'
    },
    referCode: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Agent',
    tableName: 'agents',
    underscored: true,
    hooks: {
      beforeCreate: async (agent) => {
        if (agent.password) {
          agent.password = await bcrypt.hash(agent.password, 10);
        }
      },
      beforeUpdate: async (agent) => {
        if (agent.changed('password')) {
          agent.password = await bcrypt.hash(agent.password, 10);
        }
      }
    },
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: { attributes: { include: ['password'] } }
    }
  });

  return Agent;
};