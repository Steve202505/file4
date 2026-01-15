'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('agent_assigned_users', {
            agent_id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.CHAR(36),
                references: {
                    model: 'agents',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            user_id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.CHAR(36),
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            }
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('agent_assigned_users');
    }
};
