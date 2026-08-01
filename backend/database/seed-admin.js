const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const User = require('../models/User');
const Admin = require('../models/Admin');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@admin.com';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const run = async () => {
  await sequelize.sync();
  console.log('Database synced.');

  let user = await User.findOne({ where: { email: ADMIN_EMAIL } });
  if (!user) {
    user = await User.findOne({ where: { name: ADMIN_USERNAME } });
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (user) {
    await user.update({ password: hashedPassword, is_active: true, is_verified: true, role: 'admin' });
    console.log(`Updated existing admin user (id=${user.id}, name=${user.name}, email=${user.email}).`);
  } else {
    user = await User.create({
      name: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
      is_active: true,
      is_verified: true,
    });
    console.log(`Created admin user (id=${user.id}).`);
  }

  const [adminRecord, created] = await Admin.findOrCreate({
    where: { user_id: user.id },
    defaults: { role_level: 'super_admin' },
  });
  if (!created) {
    await adminRecord.update({ role_level: 'super_admin' });
  }

  console.log('Admin record ensured in admins table (role_level=super_admin).');
  console.log('------------------------------------------------------------');
  console.log(`Admin login:  username = "${ADMIN_USERNAME}"  OR  email = "${ADMIN_EMAIL}"`);
  console.log(`Admin password: "${ADMIN_PASSWORD}"`);
  console.log('Login page: http://localhost:3000/login/admin');

  await sequelize.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
