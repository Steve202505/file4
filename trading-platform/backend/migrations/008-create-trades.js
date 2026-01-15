'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('trades', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.CHAR(36),
                defaultValue: Sequelize.UUIDV4
            },
            user_id: {
                allowNull: false,
                type: Sequelize.CHAR(36),
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            pair: {
                type: Sequelize.STRING(20),
                allowNull: false
            },
            type: {
                type: Sequelize.ENUM('buy', 'sell'),
                allowNull: false
            },
            amount: {
                type: Sequelize.DECIMAL(20, 8),
                allowNull: false
            },
            entry_price: {
                type: Sequelize.DECIMAL(20, 8),
                allowNull: false
            },
            exit_price: {
                type: Sequelize.DECIMAL(20, 8),
                allowNull: true
            },
            status: {
                type: Sequelize.ENUM('pending', 'won', 'lost', 'cancelled'),
                defaultValue: 'pending'
            },
            pnl: {
                type: Sequelize.DECIMAL(20, 8),
                defaultValue: 0
            },
            duration: {
                type: Sequelize.INTEGER.UNSIGNED,
                defaultValue: 60
            },
            order_no: {
                type: Sequelize.STRING(50),
                unique: true
            },
            leverage: {
                type: Sequelize.TINYINT.UNSIGNED,
                defaultValue: 1
            },
            profit_rate: {
                type: Sequelize.DECIMAL(5, 2),
                defaultValue: 90.00
            },
            resolve_at: {
                type: Sequelize.DATE(3),
                allowNull: true
            },
            is_win: {
                type: Sequelize.BOOLEAN,
                allowNull: true
            },
            target_price: {
                type: Sequelize.DECIMAL(20, 8),
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });

        await queryInterface.addIndex('trades', ['user_id']);
        await queryInterface.addIndex('trades', ['order_no']);
        await queryInterface.addIndex('trades', ['resolve_at']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('trades');
    }
};
