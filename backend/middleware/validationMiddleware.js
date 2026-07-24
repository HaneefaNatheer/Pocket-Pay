const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return res.status(400).json({
      success: false,
      message: messages.join(', '),
      errors: errors.array(),
    });
  }
  next();
};

const validateRegistration = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required.')
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters.'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  body('role')
    .notEmpty().withMessage('Role is required.')
    .isIn(['student', 'employer', 'admin']).withMessage('Role must be student, employer, or admin.'),
  handleValidation,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.'),
  handleValidation,
];

const validateJobPost = [
  body('title')
    .trim()
    .notEmpty().withMessage('Job title is required.')
    .isLength({ max: 200 }).withMessage('Title must be at most 200 characters.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Job description is required.')
    .isLength({ max: 5000 }).withMessage('Description must be at most 5000 characters.'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required.'),
  body('salary_min')
    .optional()
    .isFloat({ min: 0 }).withMessage('Minimum salary must be a non-negative number.'),
  body('salary_max')
    .optional()
    .isFloat({ min: 0 }).withMessage('Maximum salary must be a non-negative number.')
    .custom((value, { req }) => {
      if (req.body.salary_min && parseFloat(value) < parseFloat(req.body.salary_min)) {
        throw new Error('Maximum salary must be greater than or equal to minimum salary.');
      }
      return true;
    }),
  handleValidation,
];

const validateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Name must be at most 100 characters.'),
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s\-()]{7,20}$/).withMessage('Must be a valid phone number.'),
  handleValidation,
];

const validateApplication = [
  body('job_id')
    .notEmpty().withMessage('Job ID is required.')
    .isInt({ min: 1 }).withMessage('Job ID must be a positive integer.'),
  handleValidation,
];

const validateTimetable = [
  body('day_of_week')
    .notEmpty().withMessage('Day of week is required.')
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Must be a valid day of the week.'),
  body('start_time')
    .notEmpty().withMessage('Start time is required.')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('Start time must be in HH:MM format (24-hour).'),
  body('end_time')
    .notEmpty().withMessage('End time is required.')
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/).withMessage('End time must be in HH:MM format (24-hour).')
    .custom((value, { req }) => {
      if (value <= req.body.start_time) {
        throw new Error('End time must be after start time.');
      }
      return true;
    }),
  handleValidation,
];

const validateReport = [
  body('type')
    .notEmpty().withMessage('Report type is required.')
    .isIn(['fake_job', 'inappropriate', 'scam', 'harassment', 'other'])
    .withMessage('Must be a valid report type.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.')
    .isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters.'),
  handleValidation,
];

module.exports = {
  handleValidation,
  validateRegistration,
  validateLogin,
  validateJobPost,
  validateProfile,
  validateApplication,
  validateTimetable,
  validateReport,
};
