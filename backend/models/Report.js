const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reporter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  reported_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'jobs',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM('fake_job', 'inappropriate', 'scam', 'harassment', 'other'),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'investigating', 'resolved', 'dismissed'),
    defaultValue: 'pending',
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'reports',
  timestamps: true,
});

const User = require('./User');
const Job = require('./Job');

Report.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'reported_id', as: 'reportedUser' });
Report.belongsTo(Job, { foreignKey: 'job_id', as: 'linkedJob' });
User.hasMany(Report, { foreignKey: 'reporter_id', as: 'reportedReports' });
User.hasMany(Report, { foreignKey: 'reported_id', as: 'reportsReceived' });

module.exports = Report;
