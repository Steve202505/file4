const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { validatePasswordReset, validateBalanceUpdate } = require('../utils/validators');

// Apply auth middleware to all user routes
router.use(authMiddleware);

// Profile routes
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.put('/locale', userController.updateLocale);
router.put('/change-password', userController.changePassword);

// Balance routes
router.get('/balance', userController.getUserBalance);
router.post('/withdraw', userController.requestWithdrawal);

// Win/Loss control routes
router.get('/winloss-control', userController.getUserWinLossControl);

// Referral routes
router.get('/referral-info', userController.getUserReferralInfo);

// Activity logs
router.get('/activity-logs', userController.getUserActivityLogs);

// Transactions
router.get('/transactions', userController.getUserTransactions);



// Agent info
router.get('/assigned-agent', userController.getAssignedAgent);

// Utility routes
router.get('/check-username', userController.checkUsernameAvailability);

// Session management
router.get('/validate-session', userController.validateSession);
router.post('/logout', userController.userLogout);

// Bank Card routes
router.get('/bank-cards', userController.getBankCards);
router.post('/bank-cards', userController.addBankCard);
router.delete('/bank-cards/:id', userController.deleteBankCard);

// Crypto Wallet routes
router.get('/crypto-wallets', userController.getCryptoWallets);
router.post('/crypto-wallets', userController.addCryptoWallet);
router.delete('/crypto-wallets/:id', userController.deleteCryptoWallet);

// Deposit Addresses (Admin/Agent wallets for top-up)
router.get('/deposit-addresses', userController.getDepositAddresses);

module.exports = router;