const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SEED_PASSWORD = 'Password@123';

const sampleStudents = [
  { name: 'Alice Johnson',  email: 'alice@student.com',   university: 'State University',   degree: 'Computer Science', year: 3 },
  { name: 'Bob Smith',      email: 'bob@student.com',     university: 'City College',        degree: 'Business Admin',   year: 2 },
  { name: 'Carol Williams', email: 'carol@student.com',   university: 'Tech Institute',      degree: 'Graphic Design',   year: 4 },
  { name: 'David Brown',    email: 'david@student.com',   university: 'State University',    degree: 'Marketing',        year: 1 },
  { name: 'Eva Martinez',   email: 'eva@student.com',     university: 'Metro University',    degree: 'Data Science',     year: 3 },
];

const sampleEmployers = [
  { name: 'TechCorp HR',     email: 'hr@techcorp.com',     company: 'TechCorp Inc.',      industry: 'Technology',   size: '51-200' },
  { name: 'GreenLeaf Mgmt',  email: 'jobs@greenleaf.com',  company: 'GreenLeaf Cafe',     industry: 'Food Service', size: '11-50' },
  { name: 'Urban Retail',    email: 'hiring@urbanretail.com', company: 'Urban Retail Co.', industry: 'Retail',       size: '201-500' },
];

const sampleJobs = [
  { employer: 0, title: 'Frontend Developer Intern',        category: 'internship',   type: 'onsite',   salaryType: 'hourly', min: 15, max: 20 },
  { employer: 0, title: 'Backend Developer Part-Time',      category: 'part-time',    type: 'remote',   salaryType: 'hourly', min: 20, max: 30 },
  { employer: 0, title: 'UI/UX Design Freelancer',          category: 'freelance',    type: 'hybrid',   salaryType: 'fixed',  min: 500, max: 1000 },
  { employer: 0, title: 'Data Entry Clerk',                 category: 'admin',        type: 'onsite',   salaryType: 'hourly', min: 12, max: 16 },
  { employer: 1, title: 'Barista / Coffee Shop Assistant',  category: 'food-service', type: 'onsite',   salaryType: 'hourly', min: 11, max: 14 },
  { employer: 1, title: 'Weekend Kitchen Helper',           category: 'food-service', type: 'onsite',   salaryType: 'daily',  min: 60, max: 80 },
  { employer: 1, title: 'Delivery Driver',                  category: 'delivery',     type: 'onsite',   salaryType: 'hourly', min: 13, max: 18 },
  { employer: 2, title: 'Retail Sales Associate',           category: 'retail',       type: 'onsite',   salaryType: 'hourly', min: 12, max: 15 },
  { employer: 2, title: 'Visual Merchandiser',              category: 'creative',     type: 'onsite',   salaryType: 'hourly', min: 14, max: 18 },
  { employer: 2, title: 'Online Store Tutor',               category: 'tutoring',     type: 'remote',   salaryType: 'hourly', min: 16, max: 22 },
];

const sampleSkills = [
  { name: 'JavaScript',   category: 'programming' },
  { name: 'Graphic Design', category: 'design' },
  { name: 'Social Media Marketing', category: 'marketing' },
  { name: 'Customer Service', category: 'customer-service' },
  { name: 'Microsoft Office', category: 'technical' },
];

async function seed() {
  console.log('Connecting to MySQL...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('Running schema.sql...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await connection.query(schema);
  console.log('Schema executed.');

  await connection.query('USE student_job_connect');

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
  const adminHashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

  console.log('Seeding admin user...');
  await connection.query(
    `INSERT IGNORE INTO users (name, email, password, role, is_verified, is_active)
     VALUES (?, ?, ?, 'admin', 1, 1)`,
    ['System Admin', 'admin@jobconnect.com', adminHashedPassword]
  );

  console.log('Seeding students...');
  const studentUserIds = [];
  for (const s of sampleStudents) {
    const [result] = await connection.query(
      `INSERT IGNORE INTO users (name, email, password, role, is_verified, is_active)
       VALUES (?, ?, ?, 'student', 1, 1)`,
      [s.name, s.email, hashedPassword]
    );
    if (result.insertId === 0) {
      const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', [s.email]);
      studentUserIds.push(rows[0].id);
    } else {
      studentUserIds.push(result.insertId);
    }
    await connection.query(
      `INSERT IGNORE INTO students (user_id, university, degree, year_of_study)
       VALUES (?, ?, ?, ?)`,
      [studentUserIds[studentUserIds.length - 1], s.university, s.degree, s.year]
    );
  }

  console.log('Seeding employers...');
  const employerUserIds = [];
  const employerIds = [];
  for (const e of sampleEmployers) {
    const [result] = await connection.query(
      `INSERT IGNORE INTO users (name, email, password, role, is_verified, is_active)
       VALUES (?, ?, ?, 'employer', 1, 1)`,
      [e.name, e.email, hashedPassword]
    );
    if (result.insertId === 0) {
      const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', [e.email]);
      employerUserIds.push(rows[0].id);
    } else {
      employerUserIds.push(result.insertId);
    }
    await connection.query(
      `INSERT IGNORE INTO employers (user_id, company_name, industry, company_size, is_verified)
       VALUES (?, ?, ?, ?, 1)`,
      [employerUserIds[employerUserIds.length - 1], e.company, e.industry, e.size]
    );
    const [empRows] = await connection.query('SELECT id FROM employers WHERE user_id = ?', [
      employerUserIds[employerUserIds.length - 1],
    ]);
    employerIds.push(empRows[0].id);
  }

  console.log('Seeding jobs...');
  for (const j of sampleJobs) {
    await connection.query(
      `INSERT IGNORE INTO jobs (employer_id, title, description, requirements, category, job_type, salary_type, salary_min, salary_max, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        employerIds[j.employer],
        j.title,
        `Description for ${j.title}. This is a great opportunity for students.`,
        'Good communication skills, reliable, and eager to learn.',
        j.category,
        j.type,
        j.salaryType,
        j.min,
        j.max,
        '123 Main Street, City Center',
      ]
    );
  }

  console.log('Seeding skills...');
  for (const sk of sampleSkills) {
    await connection.query(
      'INSERT IGNORE INTO skills (name, category) VALUES (?, ?)',
      [sk.name, sk.category]
    );
  }

  console.log('\nSeed completed successfully!');
  console.log('--------------------------------------');
  console.log('Admin login:   admin@jobconnect.com / Password@123');
  console.log('Student logins:');
  sampleStudents.forEach((s) => console.log(`  ${s.email} / Password@123`));
  console.log('Employer logins:');
  sampleEmployers.forEach((e) => console.log(`  ${e.email} / Password@123`));
  console.log('--------------------------------------');

  await connection.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
