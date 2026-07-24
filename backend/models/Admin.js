const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  role_level: {
    type: DataTypes.ENUM('super_admin', 'moderator'),
    defaultValue: 'moderator',
  },
  last_action: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'admins',
  timestamps: true,
});

Admin.associate = (models) => {
  Admin.belongsTo(models.User, { foreignKey: 'user_id' });
};

module.exports = Admin;
