'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class WinLossControl extends Model {
    static associate(models) {
      WinLossControl.belongsTo(models.User, { foreignKey: 'userId' });
      WinLossControl.belongsTo(models.Agent, { as: 'modifiedBy', foreignKey: 'modifiedById' });
    }
  }

  WinLossControl.init({
    id: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      unique: true
    },
    controlLevel: {
      type: DataTypes.ENUM('high', 'medium', 'low', 'none'),
      defaultValue: 'none'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    modifiedById: {
      type: DataTypes.CHAR(36),
      allowNull: false
    },
    notes: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: { len: [0, 500] }
    }
  }, {
    sequelize,
    modelName: 'WinLossControl',
    tableName: 'win_loss_controls',
    underscored: true,
    indexes: [
      { name: 'idx_winloss_user_active', fields: ['user_id', 'is_active'] }
    ]
  });

  return WinLossControl;
};