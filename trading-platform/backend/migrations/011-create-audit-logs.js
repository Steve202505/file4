'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('audit_logs', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.CHAR(36),
                defaultValue: Sequelize.UUIDV4
            },
            action: {
                type: Sequelize.ENUM(
                    'user_created',
                    'user_updated',
                    'user_deleted',
                    'login',
                    'logout',
                    'password_change',
                    'winloss_control_updated',
                    'agent_created',
                    'agent_updated',
                    'agent_deleted',
                    'balance_updated',
                    'balance_adjusted',
                    'withdrawal_requested',
                    'withdrawal_approved',
                    'withdrawal_rejected',
                    'trade_placed',
                    'trade_won',
                    'trade_loss'
                ),
                allowNull: false
            },
            performed_by_id: {
                type: Sequelize.CHAR(36),
                allowNull: false
            },
            performed_by_model: {
                type: Sequelize.ENUM('User', 'Agent'),
                allowNull: false
            },
            target_user_id: {
                type: Sequelize.CHAR(36),
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            target_agent_id: {
                type: Sequelize.CHAR(36),
                allowNull: true,
                references: {
                    model: 'agents',
                    key: 'id'
                }
            },
            old_data: {
                type: Sequelize.JSON,
                allowNull: true
            },
            new_data: {
                type: Sequelize.JSON,
                allowNull: true
            },
            ip_address: {
                type: Sequelize.STRING(45),
                allowNull: true
            },
            user_agent: {
                type: Sequelize.TEXT,
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

        await queryInterface.addIndex('audit_logs', ['action', 'created_at']);
        await queryInterface.addIndex('audit_logs', ['performed_by_id', 'created_at']);
        await queryInterface.addIndex('audit_logs', ['target_user_id']);
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('audit_logs');
    }
};
