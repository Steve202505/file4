const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/tradeController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/place', tradeController.placeTrade);
router.get('/history', tradeController.getTradeHistory);

module.exports = router;
