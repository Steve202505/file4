'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AuditLog extends Model {
    static associate(models) {
      AuditLog.belongsTo(models.User, { as: 'targetUser', foreignKey: 'targetUserId' });
      AuditLog.belongsTo(models.Agent, { as: 'targetAgent', foreignKey: 'targetAgentId' });
    }
  }

  AuditLog.init({
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    action: {
      type: DataTypes.ENUM(
        'user_created', 'user_updated', 'user_deleted',
        'login', 'logout', 'password_change',
        'winloss_control_updated',
        'agent_created', 'agent_updated', 'agent_deleted',
        'balance_updated', 'balance_adjusted',
        'withdrawal_requested', 'withdrawal_approved', 'withdrawal_rejected',
        'trade_placed', 'trade_won', 'trade_loss'
      ),
      allowNull: false
    },
    performedById: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    performedByModel: {
      type: DataTypes.ENUM('User', 'Agent'),
      allowNull: false
    },
    targetUserId: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    targetAgentId: {
      type: DataTypes.CHAR(36),
      allowNull: true
    },
    oldData: {
      type: DataTypes.JSON,
      allowNull: true
    },
    newData: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'AuditLog',
    tableName: 'audit_logs',
    underscored: true,
    indexes: [
      { name: 'idx_audit_action_created', fields: ['action', { name: 'created_at', order: 'DESC' }] },
      { name: 'idx_audit_performer_created', fields: ['performed_by_id', { name: 'created_at', order: 'DESC' }] },
      { fields: ['target_user_id'] }
    ]
  });

  return AuditLog;
};