const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { submitContact, getContactMessages, replyToMessage } = require('../controllers/contactController');

router.post('/', submitContact);
router.get('/', authenticateToken, authorizeRoles('admin'), getContactMessages);
router.post('/:id/reply', authenticateToken, authorizeRoles('admin'), replyToMessage);

module.exports = router;
