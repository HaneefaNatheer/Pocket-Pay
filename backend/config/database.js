const { Sequelize } = require('sequelize');
require('dotenv').config();

// Determine which database to use
const useMySQL = process.env.DB_NAME && process.env.DB_USER && process.env.DB_HOST;

let sequelize;
if (useMySQL) {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      define: { timestamps: true, underscored: true }
    }
  );
} else {
  try {
    require('sqlite3');
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: './database.sqlite',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: { timestamps: true, underscored: true }
    });
  } catch (e) {
    console.error('SQLite not available. Please either:');
    console.error('  1. Set up MySQL in backend/.env (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD)');
    console.error('  2. Or run: cd backend && npm install sqlite3 && npm rebuild sqlite3');
    process.exit(1);
  }
}

module.exports = sequelize;
