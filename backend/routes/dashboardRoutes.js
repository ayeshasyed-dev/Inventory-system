const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getStockLogs,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats', protect, getDashboardStats);
router.get('/stock-logs', protect, getStockLogs);

module.exports = router;
