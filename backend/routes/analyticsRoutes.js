const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getOverview,
  getMonthlyGrowth,
  getJobCategoryStats,
  getApplicationStats,
  getActiveUsers,
  getTopEmployers,
  getStudentStats,
} = require('../controllers/analyticsController');

router.use(authenticateToken, authorizeRoles('admin'));

router.get('/overview', getOverview);
router.get('/monthly-growth', getMonthlyGrowth);
router.get('/job-categories', getJobCategoryStats);
router.get('/applications', getApplicationStats);
router.get('/active-users', getActiveUsers);
router.get('/top-employers', getTopEmployers);
router.get('/student-stats', getStudentStats);

module.exports = router;
