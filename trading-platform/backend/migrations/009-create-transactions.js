'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('transactions', {
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
            type: {
                type: Sequelize.ENUM(
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
                type: Sequelize.DECIMAL(20, 8),
                allowNull: false
            },
            old_balance: {
                type: Sequelize.DECIMAL(20, 8),
                allowNull: false
            },
            new_balance: {
                type: Sequelize.DECIMAL(20, 8),
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('pending', 'completed', 'failed', 'rejected'),
                defaultValue: 'completed'
            },
            description: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            performed_by_id: {
                type: Sequelize.CHAR(36),
                allowNull: true,
                references: {
                    model: 'agents',
                    key: 'id'
                }
            },
            reference: {
                type: Sequelize.STRING(100),
                unique: true,
                allowNull: false
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

        await queryInterface.addIndex('transactions', ['user_id']);
        await queryInterface.addIndex('transactions', ['reference']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('transactions');
    }
};
