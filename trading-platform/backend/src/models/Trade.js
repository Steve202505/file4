'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Trade extends Model {
        static associate(models) {
            Trade.belongsTo(models.User, { foreignKey: 'userId' });
        }
    }

    Trade.init({
        id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.CHAR(36),
            allowNull: false
        },
        pair: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('buy', 'sell'),
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
        entryPrice: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: false,
            get() {
                const value = this.getDataValue('entryPrice');
                return value === null ? null : parseFloat(value);
            }
        },
        exitPrice: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: true,
            get() {
                const value = this.getDataValue('exitPrice');
                return value === null ? null : parseFloat(value);
            }
        },
        status: {
            type: DataTypes.ENUM('pending', 'won', 'lost', 'cancelled'),
            defaultValue: 'pending'
        },
        pnl: {
            type: DataTypes.DECIMAL(20, 8),
            defaultValue: 0,
            get() {
                const value = this.getDataValue('pnl');
                return value === null ? null : parseFloat(value);
            }
        },
        duration: {
            type: DataTypes.INTEGER.UNSIGNED,
            defaultValue: 60
        },
        orderNo: {
            type: DataTypes.STRING(50),
            unique: true
        },
        leverage: {
            type: DataTypes.TINYINT.UNSIGNED,
            defaultValue: 1
        },
        profitRate: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 90.00,
            get() {
                const value = this.getDataValue('profitRate');
                return value === null ? null : parseFloat(value);
            }
        },
        resolveAt: {
            type: DataTypes.DATE(3),
            allowNull: true
        },
        isWin: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        targetPrice: {
            type: DataTypes.DECIMAL(20, 8),
            allowNull: true,
            get() {
                const value = this.getDataValue('targetPrice');
                return value === null ? null : parseFloat(value);
            }
        }
    }, {
        sequelize,
        modelName: 'Trade',
        tableName: 'trades',
        underscored: true,
        indexes: [
            { fields: ['user_id'] },
            { fields: ['order_no'] },
            { fields: ['resolve_at'] }
        ],
        hooks: {
            beforeCreate: async (trade) => {
                if (!trade.orderNo) {
                    const now = new Date();
                    const timestamp = now.getFullYear().toString() +
                        (now.getMonth() + 1).toString().padStart(2, '0') +
                        now.getDate().toString().padStart(2, '0') +
                        now.getHours().toString().padStart(2, '0') +
                        now.getMinutes().toString().padStart(2, '0') +
                        now.getSeconds().toString().padStart(2, '0');
                    trade.orderNo = `${timestamp}${Math.floor(1000 + Math.random() * 9000)}`;
                }
            }
        }
    });

    return Trade;
};
