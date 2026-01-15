'use strict';

/**
 * Sequelize Transaction Wrapper
 * 
 * Provides ACID-compliant transaction handling for critical operations.
 * Replaces the MongoDB withTransaction utility for Sequelize.
 * 
 * Usage:
 *   const { withTransaction } = require('../utils/sequelizeTransactionWrapper');
 *   
 *   await withTransaction(async (transaction) => {
 *     const user = await User.findByPk(userId, { lock: true, transaction });
 *     // ... perform operations
 *   });
 */

const { sequelize, Sequelize } = require('../models');

/**
 * Execute operations within a managed Sequelize transaction.
 * Automatically commits on success, rolls back on error.
 * 
 * @param {Function} callback - Async function receiving transaction object
 * @param {Object} options - Optional transaction options
 * @param {string} options.isolationLevel - Transaction isolation level
 * @returns {Promise<any>} - Result from callback
 * @throws {Error} - Re-throws any error after rollback
 */
async function withTransaction(callback, options = {}) {
    const transaction = await sequelize.transaction({
        isolationLevel: options.isolationLevel || Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        ...options
    });

    try {
        const result = await callback(transaction);
        await transaction.commit();
        return result;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

/**
 * Execute operations with row-level locking (SELECT FOR UPDATE).
 * Use this for critical financial operations.
 * 
 * @param {Function} callback - Async function receiving transaction object
 * @returns {Promise<any>} - Result from callback
 */
async function withLockingTransaction(callback) {
    return withTransaction(callback, {
        isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE
    });
}

module.exports = {
    withTransaction,
    withLockingTransaction
};
