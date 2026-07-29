const JOB_CATEGORIES = [
  'internship',
  'part-time',
  'freelance',
  'remote',
  'tutoring',
  'delivery',
  'retail',
  'food-service',
  'admin',
  'tech',
  'creative',
  'other',
];

const SKILL_CATEGORIES = [
  'programming',
  'design',
  'marketing',
  'communication',
  'management',
  'finance',
  'education',
  'customer-service',
  'data-analysis',
  'languages',
  'creative',
  'technical',
  'other',
];

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const APPLICATION_STATUSES = [
  'pending',
  'reviewed',
  'shortlisted',
  'interview',
  'accepted',
  'rejected',
];

const USER_ROLES = ['student', 'employer', 'admin'];

const PAGINATION_DEFAULTS = {
  page: 1,
  limit: 10,
};

const FILE_SIZE_LIMITS = {
  profilePicture: 2 * 1024 * 1024,
  cv: 5 * 1024 * 1024,
  document: 10 * 1024 * 1024,
  logo: 3 * 1024 * 1024,
};

module.exports = {
  JOB_CATEGORIES,
  SKILL_CATEGORIES,
  DAYS_OF_WEEK,
  APPLICATION_STATUSES,
  USER_ROLES,
  PAGINATION_DEFAULTS,
  FILE_SIZE_LIMITS,
};
