const express = require('express');
const router = express.Router();
const { saveSession, getSessions } = require('../controllers/focusController');
const { protect } = require('../middleware/authMiddleware');

router.get('/sessions', protect, getSessions);
router.post('/session', protect, saveSession);

module.exports = router;
