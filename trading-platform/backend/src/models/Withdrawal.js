'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Withdrawal extends Model {
        static associate(models) {
            Withdrawal.belongsTo(models.User, { foreignKey: 'userId' });
            Withdrawal.belongsTo(models.Agent, { as: 'reviewedBy', foreignKey: 'reviewedById' });
            Withdrawal.belongsTo(models.Transaction, { foreignKey: 'transactionId' });
        }
    }

    Withdrawal.init({
        id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.CHAR(36),
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: false,
            validate: { min: 0 },
            get() {
                const value = this.getDataValue('amount');
                return value === null ? null : parseFloat(value);
            }
        },
        currency: {
            type: DataTypes.STRING(10),
            defaultValue: 'USD'
        },
        method: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        accountDetails: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending'
        },
        reviewedById: {
            type: DataTypes.CHAR(36),
            allowNull: true
        },
        reviewNotes: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        reviewedAt: {
            type: DataTypes.DATE(3),
            allowNull: true
        },
        transactionId: {
            type: DataTypes.CHAR(36),
            allowNull: true
        },
        orderNumber: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Withdrawal',
        tableName: 'withdrawals',
        underscored: true,
        indexes: [
            { fields: ['user_id'] },
            { fields: ['order_number'] }
        ],
        hooks: {
            beforeCreate: async (withdrawal) => {
                if (!withdrawal.orderNumber) {
                    withdrawal.orderNumber = `WDR-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
                }
            }
        }
    });

    return Withdrawal;
};
