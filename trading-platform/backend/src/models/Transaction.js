'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        static associate(models) {
            Transaction.belongsTo(models.User, { foreignKey: 'userId' });
            Transaction.belongsTo(models.Agent, { as: 'performedBy', foreignKey: 'performedById' });
            Transaction.hasOne(models.Withdrawal, { foreignKey: 'transactionId' });
        }
    }

    Transaction.init({
        id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.CHAR(36),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM(
                'deposit',
                'withdrawal',
                'bonus',
                'adjustment',
                'trade',
                'trade_win',
                'trade_loss'
            ),
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: false,
            get() {
                const value = this.getDataValue('amount');
                return value === null ? null : parseFloat(value);
            }
        },
        oldBalance: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: false,
            get() {
                const value = this.getDataValue('oldBalance');
                return value === null ? null : parseFloat(value);
            }
        },
        newBalance: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: false,
            get() {
                const value = this.getDataValue('newBalance');
                return value === null ? null : parseFloat(value);
            }
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'failed', 'rejected'),
            defaultValue: 'completed'
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        performedById: {
            type: DataTypes.CHAR(36),
            allowNull: true
        },
        reference: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Transaction',
        tableName: 'transactions',
        underscored: true,
        indexes: [
            { fields: ['user_id'] },
            { fields: ['reference'] }
        ],
        hooks: {
            beforeValidate: async (transaction) => {
                if (!transaction.reference) {
                    transaction.reference = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
                }
            }
        }
    });

    return Transaction;
};
