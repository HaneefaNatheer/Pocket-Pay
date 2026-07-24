const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Timetable = sequelize.define('Timetable', {
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
  day_of_week: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  is_busy: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
}, {
  tableName: 'timetables',
  timestamps: true,
});

Timetable.associate = (models) => {
  Timetable.belongsTo(models.Student, { foreignKey: 'student_id' });
};

module.exports = Timetable;
