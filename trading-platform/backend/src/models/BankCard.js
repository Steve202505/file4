'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BankCard extends Model {
        static associate(models) {
            BankCard.belongsTo(models.User, { foreignKey: 'userId' });
            BankCard.belongsTo(models.Agent, { foreignKey: 'agentId' });
        }
    }

    BankCard.init({
        id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        agentId: {
            type: DataTypes.CHAR(36),
            allowNull: true
        },
        userId: {
            type: DataTypes.CHAR(36),
            allowNull: true
        },
        bankName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        accountName: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        accountNumber: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        username: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }
    }, {
        sequelize,
        modelName: 'BankCard',
        tableName: 'bank_cards',
        underscored: true,
        indexes: [{ fields: ['user_id'] }]
    });

    return BankCard;
};
