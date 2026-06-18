const express = require('express');
const router = express.Router();
const { getWeeklyAnalytics, getCategoryAnalytics, getSummary } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/weekly', protect, getWeeklyAnalytics);
router.get('/category', protect, getCategoryAnalytics);
router.get('/summary', protect, getSummary);

module.exports = router;
