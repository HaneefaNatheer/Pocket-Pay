const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateProfile, validateTimetable, handleValidation } = require('../middleware/validationMiddleware');
const { uploadProfile, uploadCV } = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  uploadCV: uploadCvController,
  getTimetable,
  addTimetable,
  updateTimetable,
  deleteTimetable,
  getSkills,
  addSkill,
  removeSkill,
  getRecommendedJobs,
} = require('../controllers/studentController');

router.use(authenticateToken, authorizeRoles('student'));

router.get('/profile', getProfile);
router.put('/profile', validateProfile, handleValidation, updateProfile);
router.post('/upload-picture', uploadProfile, uploadProfilePicture);
router.post('/upload-cv', uploadCV, uploadCvController);
router.get('/timetable', getTimetable);
router.post('/timetable', validateTimetable, handleValidation, addTimetable);
router.put('/timetable/:id', updateTimetable);
router.delete('/timetable/:id', deleteTimetable);
router.get('/skills', getSkills);
router.post('/skills', addSkill);
router.delete('/skills/:skillId', removeSkill);
router.get('/recommended-jobs', getRecommendedJobs);

module.exports = router;
