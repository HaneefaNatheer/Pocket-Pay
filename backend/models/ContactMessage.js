const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { isEmail: true }
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  admin_reply: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'contact_messages',
  timestamps: true
});

module.exports = ContactMessage;
