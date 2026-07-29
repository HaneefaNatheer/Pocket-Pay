const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SavedJob = sequelize.define('SavedJob', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'students',
      key: 'id',
    },
  },
  job_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'id',
    },
  },
}, {
  tableName: 'saved_jobs',
  timestamps: true,
});

SavedJob.associate = (models) => {
  SavedJob.belongsTo(models.Student, { foreignKey: 'student_id' });
  SavedJob.belongsTo(models.Job, { foreignKey: 'job_id' });
};

module.exports = SavedJob;
