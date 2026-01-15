'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('agent_permissions', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.CHAR(36),
                defaultValue: Sequelize.UUIDV4
            },
            agent_id: {
                allowNull: false,
                type: Sequelize.CHAR(36),
                references: {
                    model: 'agents',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            permission: {
                type: Sequelize.ENUM(
                    'view_users',
                    'edit_users',
                    'manage_winloss',
                    'delete_users',
                    'view_withdrawals',
                    'edit_withdrawals',
                    'view_trades'
                ),
                allowNull: false
            }
        });

        await queryInterface.addConstraint('agent_permissions', {
            fields: ['agent_id', 'permission'],
            type: 'unique',
            name: 'idx_agent_permissions_unique'
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('agent_permissions');
    }
};
