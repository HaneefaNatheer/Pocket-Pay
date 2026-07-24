const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles, optionalAuth } = require('../middleware/authMiddleware');
const { validateJobPost, handleValidation } = require('../middleware/validationMiddleware');
const {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  searchJobs,
  getJobsByEmployer,
  saveJob,
  unsaveJob,
  getSavedJobs,
  checkSaved,
} = require('../controllers/jobController');

router.get('/', optionalAuth, getAllJobs);
router.get('/search', searchJobs);
router.get('/saved', authenticateToken, authorizeRoles('student'), getSavedJobs);
router.get('/employer/:employerId', getJobsByEmployer);
router.get('/:id', optionalAuth, getJobById);
router.post('/', authenticateToken, authorizeRoles('employer'), validateJobPost, handleValidation, createJob);
router.put('/:id', authenticateToken, authorizeRoles('employer'), updateJob);
router.delete('/:id', authenticateToken, authorizeRoles('employer', 'admin'), deleteJob);
router.post('/:id/save', authenticateToken, authorizeRoles('student'), saveJob);
router.delete('/:id/save', authenticateToken, authorizeRoles('student'), unsaveJob);
router.get('/:id/check-saved', authenticateToken, authorizeRoles('student'), checkSaved);

module.exports = router;
