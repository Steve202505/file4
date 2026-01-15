'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('withdrawals', {
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
            amount: {
                type: Sequelize.DECIMAL(20, 8),
                allowNull: false
            },
            currency: {
                type: Sequelize.STRING(10),
                defaultValue: 'USD'
            },
            method: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            account_details: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            status: {
                type: Sequelize.ENUM('pending', 'approved', 'rejected'),
                defaultValue: 'pending'
            },
            reviewed_by_id: {
                type: Sequelize.CHAR(36),
                allowNull: true,
                references: {
                    model: 'agents',
                    key: 'id'
                }
            },
            review_notes: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            reviewed_at: {
                type: Sequelize.DATE(3),
                allowNull: true
            },
            transaction_id: {
                type: Sequelize.CHAR(36),
                allowNull: true,
                references: {
                    model: 'transactions',
                    key: 'id'
                }
            },
            order_number: {
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

        await queryInterface.addIndex('withdrawals', ['user_id']);
        await queryInterface.addIndex('withdrawals', ['order_number']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('withdrawals');
    }
};
