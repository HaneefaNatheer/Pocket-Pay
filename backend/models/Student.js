const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' }
  },
  nic: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  permanent_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  current_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  university: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  degree: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  year_of_study: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
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
  cv_file: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preferred_salary_min: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  preferred_salary_max: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  preferred_location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  profile_setup_complete: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'students',
  timestamps: true,
  paranoid: true,
  underscored: true
});

User.hasOne(Student, { foreignKey: 'user_id', as: 'studentProfile' });
Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = Student;
