'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AgentAssignedUser extends Model {
        static associate(models) {
            // Junction table - associations primarily defined in User and Agent
        }
    }

    AgentAssignedUser.init({
        agentId: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            references: { model: 'agents', key: 'id' },
            onDelete: 'CASCADE'
        },
        userId: {
            type: DataTypes.CHAR(36),
            primaryKey: true,
            references: { model: 'users', key: 'id' },
            onDelete: 'CASCADE'
        }
    }, {
        sequelize,
        modelName: 'AgentAssignedUser',
        tableName: 'agent_assigned_users',
        timestamps: false,
        underscored: true
    });

    return AgentAssignedUser;
};
