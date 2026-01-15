'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('agents', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.CHAR(36),
                defaultValue: Sequelize.UUIDV4
            },
            username: {
                type: Sequelize.STRING(50),
                allowNull: false,
                unique: true
            },
            password: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            role: {
                type: Sequelize.ENUM('agent', 'admin'),
                defaultValue: 'agent'
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            locale: {
                type: Sequelize.ENUM('en', 'zh', 'ar', 'bn', 'hi', 'ur', 'ru', 'uk', 'fr', 'km'),
                defaultValue: 'en'
            },
            refer_code: {
                type: Sequelize.STRING(20),
                unique: true,
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

        // Add indexes (if needed separately) or unique constraints above
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('agents');
    }
};
