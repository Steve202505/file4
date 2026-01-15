'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CryptoWallet extends Model {
        static associate(models) {
            CryptoWallet.belongsTo(models.User, { foreignKey: 'userId' });
            CryptoWallet.belongsTo(models.Agent, { foreignKey: 'agentId' });
        }
    }

    CryptoWallet.init({
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
        walletAddress: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        network: {
            type: DataTypes.STRING(20),
            defaultValue: 'TRC20',
            allowNull: false
        },
        alias: {
            type: DataTypes.STRING(50),
            defaultValue: 'My Wallet'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }
    }, {
        sequelize,
        modelName: 'CryptoWallet',
        tableName: 'crypto_wallets',
        underscored: true,
        indexes: [{ fields: ['user_id'] }]
    });

    return CryptoWallet;
};
