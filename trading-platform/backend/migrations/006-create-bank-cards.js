'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('bank_cards', {
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
            bank_name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            account_name: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            account_number: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            username: {
                type: Sequelize.STRING(50),
                allowNull: false
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
        await queryInterface.dropTable('bank_cards');
    }
};
