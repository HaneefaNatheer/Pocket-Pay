const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('application', 'job', 'system', 'interview'),
    allowNull: false,
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  link: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
});

Notification.associate = (models) => {
  Notification.belongsTo(models.User, { foreignKey: 'user_id' });
};

module.exports = Notification;
