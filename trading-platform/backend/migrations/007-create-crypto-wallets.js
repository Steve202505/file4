'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('crypto_wallets', {
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
            wallet_address: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            network: {
                type: Sequelize.STRING(20),
                defaultValue: 'TRC20',
                allowNull: false
            },
            alias: {
                type: Sequelize.STRING(50),
                defaultValue: 'My Wallet'
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive'),
                defaultValue: 'active'
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
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('crypto_wallets');
    }
};
