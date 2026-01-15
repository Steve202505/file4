const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateUserSignup } = require('../middleware/validation');
const auth = require('../middleware/auth');

// User routes
router.post('/signup', validateUserSignup, authController.userSignup);
router.post('/login', authController.userLogin);

// Agent/Admin routes
router.post('/agent/login', authController.agentLogin);
router.post('/agent/change-password', auth, authController.changeAgentPassword);

module.exports = router;