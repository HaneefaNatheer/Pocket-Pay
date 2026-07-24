const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateApplication, handleValidation } = require('../middleware/validationMiddleware');
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  scheduleInterview,
  withdrawApplication,
  getApplicationById,
} = require('../controllers/applicationController');

router.post('/', authenticateToken, authorizeRoles('student'), validateApplication, handleValidation, applyForJob);
router.get('/my-applications', authenticateToken, authorizeRoles('student'), getMyApplications);
router.get('/job/:jobId', authenticateToken, authorizeRoles('employer'), getJobApplications);
router.put('/:id/status', authenticateToken, authorizeRoles('employer'), updateApplicationStatus);
router.put('/:id/interview', authenticateToken, authorizeRoles('employer'), scheduleInterview);
router.delete('/:id', authenticateToken, authorizeRoles('student'), withdrawApplication);
router.get('/:id', authenticateToken, getApplicationById);

module.exports = router;
