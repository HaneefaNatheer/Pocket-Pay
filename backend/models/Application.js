const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Student = require('./Student');
const Job = require('./Job');

const Application = sequelize.define('Application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' }
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'jobs', key: 'id' }
  },
  cover_letter: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'shortlisted', 'interview', 'accepted', 'rejected'),
    defaultValue: 'pending'
  },
  employer_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  student_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  interview_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  interview_location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  applied_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  responded_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'applications',
  timestamps: true,
  paranoid: true,
  underscored: true
});

Student.hasMany(Application, { foreignKey: 'student_id', as: 'applications' });
Job.hasMany(Application, { foreignKey: 'job_id', as: 'applications' });
Application.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
Application.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

module.exports = Application;
