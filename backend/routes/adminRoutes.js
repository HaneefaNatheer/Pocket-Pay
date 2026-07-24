const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
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
  getSystemLogs,
} = require('../controllers/adminController');

router.use(authenticateToken, authorizeRoles('admin'));

router.get('/dashboard', getDashboardStats);
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
router.get('/logs', getSystemLogs);

module.exports = router;
