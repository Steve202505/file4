'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('win_loss_controls', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.CHAR(36),
                defaultValue: Sequelize.UUIDV4
            },
            user_id: {
                allowNull: false,
                type: Sequelize.CHAR(36),
                unique: true,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            control_level: {
                type: Sequelize.ENUM('high', 'medium', 'low', 'none'),
                defaultValue: 'none'
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true
            },
            modified_by_id: {
                allowNull: false,
                type: Sequelize.CHAR(36),
                references: {
                    model: 'agents',
                    key: 'id'
                }
            },
            notes: {
                type: Sequelize.STRING(500),
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

        await queryInterface.addIndex('win_loss_controls', ['user_id', 'is_active'], {
            name: 'idx_winloss_user_active'
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('win_loss_controls');
    }
};
