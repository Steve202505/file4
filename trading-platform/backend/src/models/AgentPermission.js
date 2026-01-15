'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AgentPermission extends Model {
        static associate(models) {
            AgentPermission.belongsTo(models.Agent, { foreignKey: 'agentId' });
        }
    }

    AgentPermission.init({
        id: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        agentId: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            references: {
                model: 'agents',
                key: 'id'
            },
            onDelete: 'CASCADE'
        },
        permission: {
            type: DataTypes.ENUM(
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
    }, {
        sequelize,
        modelName: 'AgentPermission',
        tableName: 'agent_permissions',
        timestamps: false,
        underscored: true,
        indexes: [
            {
                name: 'idx_agent_permissions',
                unique: true,
                fields: ['agent_id', 'permission']
            }
        ]
    });

    return AgentPermission;
};
