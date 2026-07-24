const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Employer = require('./Employer');
const Admin = require('./Admin');
const Job = require('./Job');
const Application = require('./Application');
const SavedJob = require('./SavedJob');
const Notification = require('./Notification');
const Timetable = require('./Timetable');
const Skill = require('./Skill');
const UserSkill = require('./UserSkill');
const Review = require('./Review');
const Report = require('./Report');
const ContactMessage = require('./ContactMessage');

module.exports = {
  sequelize,
  User,
  Student,
  Employer,
  Admin,
  Job,
  Application,
  SavedJob,
  Notification,
  Timetable,
  Skill,
  UserSkill,
  Review,
  Report,
  ContactMessage,
};
