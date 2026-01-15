'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Modify bank_cards
        await queryInterface.addColumn('bank_cards', 'agent_id', {
            type: Sequelize.CHAR(36),
            allowNull: true,
            references: {
                model: 'agents',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.changeColumn('bank_cards', 'user_id', {
            type: Sequelize.CHAR(36),
            allowNull: true // Make user_id nullable
        });

        // Modify crypto_wallets
        await queryInterface.addColumn('crypto_wallets', 'agent_id', {
            type: Sequelize.CHAR(36),
            allowNull: true,
            references: {
                model: 'agents',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        await queryInterface.changeColumn('crypto_wallets', 'user_id', {
            type: Sequelize.CHAR(36),
            allowNull: true // Make user_id nullable
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Revert bank_cards
        await queryInterface.removeColumn('bank_cards', 'agent_id');
        await queryInterface.changeColumn('bank_cards', 'user_id', {
            type: Sequelize.CHAR(36),
            allowNull: false
        });

        // Revert crypto_wallets
        await queryInterface.removeColumn('crypto_wallets', 'agent_id');
        await queryInterface.changeColumn('crypto_wallets', 'user_id', {
            type: Sequelize.CHAR(36),
            allowNull: false
        });
    }
};
