const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const withdrawalController = require('../controllers/withdrawalController');
const authMiddleware = require('../middleware/auth');
const { isAgent, checkPermission } = require('../middleware/roleCheck');

// Apply auth and agent middleware to all routes
router.use(authMiddleware, isAgent);

// User management routes
router.get('/users', checkPermission('view_users'), agentController.getAllUsers);
router.post('/users', checkPermission('edit_users'), agentController.createUser);
router.get('/users/:id', checkPermission('view_users'), agentController.getUser);
router.put('/users/:id', checkPermission('edit_users'), agentController.updateUser);
router.post('/users/:id/adjust-balance', checkPermission('edit_users'), agentController.adjustBalance);

router.delete('/users/:id', checkPermission('delete_users'), agentController.deleteUser);
router.post('/users/:id/winloss-control', checkPermission('manage_winloss'), agentController.updateWinLossControl);
router.get('/users/:userId/wallets', checkPermission('view_users'), agentController.getUserWallets);

// Profile
router.put('/locale', agentController.updateLocale);

// Trade management routes
router.get('/trades', checkPermission('view_trades'), agentController.getAllTrades);

// Withdrawal management routes
router.get('/withdrawals', checkPermission('view_withdrawals'), withdrawalController.getAllWithdrawals);
router.post('/withdrawals/:id/review', checkPermission('edit_withdrawals'), withdrawalController.reviewWithdrawal);

// Agent My Wallet Routes
router.get('/my-wallets', agentController.getMyWallets);
router.post('/my-wallets/bank-card', agentController.addMyBankCard);
router.post('/my-wallets/crypto-wallet', agentController.addMyCryptoWallet);
router.delete('/my-wallets/bank-card/:id', agentController.deleteMyBankCard);
router.delete('/my-wallets/crypto-wallet/:id', agentController.deleteMyCryptoWallet);

module.exports = router;