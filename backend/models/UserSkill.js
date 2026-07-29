const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSkill = sequelize.define('UserSkill', {
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
  skill_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'skills',
      key: 'id',
    },
  },
  proficiency: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    allowNull: false,
  },
}, {
  tableName: 'user_skills',
  timestamps: true,
});

UserSkill.associate = (models) => {
  UserSkill.belongsTo(models.User, { foreignKey: 'user_id' });
  UserSkill.belongsTo(models.Skill, { foreignKey: 'skill_id' });
};

module.exports = UserSkill;
