const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Employer = require('./Employer');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'employers', key: 'id' }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  requirements: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM(
      'internship', 'part-time', 'freelance', 'remote',
      'tutoring', 'delivery', 'retail', 'food-service',
      'admin', 'tech', 'creative', 'other'
    ),
    allowNull: false,
    defaultValue: 'part-time'
  },
  job_type: {
    type: DataTypes.ENUM('onsite', 'remote', 'hybrid'),
    defaultValue: 'onsite'
  },
  salary_min: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salary_max: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salary_type: {
    type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly', 'fixed'),
    defaultValue: 'hourly'
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  required_skills: {
    type: DataTypes.JSON,
    allowNull: true
  },
  available_days: {
    type: DataTypes.JSON,
    allowNull: true
  },
  available_hours_start: {
    type: DataTypes.TIME,
    allowNull: true
  },
  available_hours_end: {
    type: DataTypes.TIME,
    allowNull: true
  },
  max_applicants: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  current_applicants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  deadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'closed', 'expired', 'draft'),
    defaultValue: 'active'
  },
  is_urgent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'jobs',
  timestamps: true,
  paranoid: true
});

Employer.hasMany(Job, { foreignKey: 'employer_id', as: 'jobs' });
Job.belongsTo(Employer, { foreignKey: 'employer_id', as: 'employer' });

module.exports = Job;
