const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { uploadLogo } = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  uploadLogo: uploadLogoController,
  getMyJobs,
  getJobApplicants,
  downloadCV,
} = require('../controllers/employerController');

router.use(authenticateToken, authorizeRoles('employer'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/upload-logo', uploadLogo, uploadLogoController);
router.get('/my-jobs', getMyJobs);
router.get('/job/:jobId/applicants', getJobApplicants);
router.get('/download-cv/:studentId', downloadCV);

module.exports = router;
