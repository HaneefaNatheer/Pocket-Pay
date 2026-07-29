const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Employer = sequelize.define('Employer', {
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
  company_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  contact_person: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  company_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  company_logo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  company_website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  company_email: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  company_phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  company_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  business_registration: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  industry: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  company_size: {
    type: DataTypes.STRING(50),
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
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verification_documents: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  total_jobs_posted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'employers',
  timestamps: true,
  paranoid: true,
  underscored: true
});

User.hasOne(Employer, { foreignKey: 'user_id', as: 'employerProfile' });
Employer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = Employer;
