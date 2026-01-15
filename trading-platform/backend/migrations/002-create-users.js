'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.CHAR(36),
                defaultValue: Sequelize.UUIDV4
            },
            username: {
                type: Sequelize.STRING(30),
                allowNull: false,
                unique: true
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: true
            },
            mobile_number: {
                type: Sequelize.STRING(15),
                allowNull: false
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            transaction_password: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            wallet_address: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            credit_score: {
                type: Sequelize.TINYINT.UNSIGNED,
                defaultValue: 0
            },
            vip_level: {
                type: Sequelize.TINYINT.UNSIGNED,
                defaultValue: 0
            },
            is_simulated: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            refer_code: {
                type: Sequelize.STRING(20),
                allowNull: true,
                unique: true
            },
            referred_by_id: {
                type: Sequelize.CHAR(36),
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            account_balance: {
                type: Sequelize.DECIMAL(20, 8),
                defaultValue: 1000.00000000
            },
            role: {
                type: Sequelize.ENUM('user'),
                defaultValue: 'user'
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            locale: {
                type: Sequelize.ENUM('en', 'zh', 'ar', 'bn', 'hi', 'ur', 'ru', 'uk', 'fr', 'km'),
                defaultValue: 'en'
            },
            assigned_agent_id: {
                type: Sequelize.CHAR(36),
                allowNull: true,
                references: {
                    model: 'agents',
                    key: 'id'
                }
            },
            support_message: {
                type: Sequelize.TEXT,
                defaultValue: ''
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

        await queryInterface.addIndex('users', ['email', 'username', 'is_active'], {
            name: 'idx_users_email_username_active'
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('users');
    }
};
