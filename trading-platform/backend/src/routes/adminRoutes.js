const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { validateAgentCreation } = require('../middleware/validation');

// Apply auth and admin middleware to all routes
router.use(authMiddleware, isAdmin);

// Agent management routes
router.get('/agents', adminController.getAllAgents);
router.post('/agents', validateAgentCreation, adminController.createAgent);
router.put('/agents/:id', adminController.updateAgent);
router.delete('/agents/:id', adminController.deleteAgent);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

// Global settings routes
router.get('/global-settings', adminController.getGlobalSettings);
router.put('/global-settings', adminController.updateGlobalSettings);

module.exports = router;