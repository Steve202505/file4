'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('global_settings', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.CHAR(36),
                defaultValue: Sequelize.UUIDV4
            },
            global_support_message: {
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
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('global_settings');
    }
};
