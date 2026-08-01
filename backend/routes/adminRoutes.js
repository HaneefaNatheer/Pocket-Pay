const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { uploadProfile } = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  getDashboardStats,
  getAllStudents,
  getAllEmployers,
  verifyEmployer,
  blockUser,
  unblockUser,
  removeJob,
  getAllJobs,
  getAllReports,
  updateReportStatus,
  getAllReviews,
  toggleReviewVisibility,
  deleteStudent,
  deleteEmployer,
  exportData,
  getSystemLogs,
} = require('../controllers/adminController');

router.use(authenticateToken, authorizeRoles('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/profile-picture', uploadProfile, uploadProfilePicture);
router.get('/students', getAllStudents);
router.get('/employers', getAllEmployers);
router.put('/verify-employer/:id', verifyEmployer);
router.put('/block-user/:id', blockUser);
router.put('/unblock-user/:id', unblockUser);
router.delete('/job/:id', removeJob);
router.get('/jobs', getAllJobs);
router.get('/reports', getAllReports);
router.put('/reports/:id', updateReportStatus);
router.get('/reviews', getAllReviews);
router.put('/reviews/:id/visibility', toggleReviewVisibility);
router.delete('/student/:id', deleteStudent);
router.delete('/employer/:id', deleteEmployer);
router.get('/export/:type', exportData);
router.get('/logs', getSystemLogs);

module.exports = router;
