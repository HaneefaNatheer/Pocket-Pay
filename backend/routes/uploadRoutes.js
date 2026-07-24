const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { uploadProfile, uploadCV, uploadLogo } = require('../middleware/uploadMiddleware');

router.post('/profile', authenticateToken, uploadProfile, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({ success: true, message: 'Profile picture uploaded', data: { filePath: '/uploads/profiles/' + req.file.filename } });
});

router.post('/cv', authenticateToken, uploadCV, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({ success: true, message: 'CV uploaded', data: { filePath: '/uploads/cv/' + req.file.filename } });
});

router.post('/logo', authenticateToken, authorizeRoles('employer'), uploadLogo, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({ success: true, message: 'Logo uploaded', data: { filePath: '/uploads/logos/' + req.file.filename } });
});

module.exports = router;
