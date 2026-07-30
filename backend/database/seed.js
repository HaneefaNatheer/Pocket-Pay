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
  // Daily Wage / Flexible → part-time
  { employer: 0, title: 'Construction Site Helper',         category: 'part-time',    type: 'onsite',  salaryType: 'daily',  min: 2500, max: 3500,  requirements: 'Physically fit, ability to carry heavy loads, basic understanding of construction tools, must wear safety gear, punctual and reliable.', workType: 'daily', shiftDuration: 480, workersNeeded: 5 },
  { employer: 1, title: 'Warehouse Packer',                 category: 'part-time',    type: 'onsite',  salaryType: 'daily',  min: 2000, max: 2800,  requirements: 'Fast worker, attention to detail, ability to stand for long hours, basic counting skills, team player.', workType: 'daily', shiftDuration: 480, workersNeeded: 3 },
  // Promotion & Event → part-time
  { employer: 2, title: 'Brand Promoter - Supermarket',     category: 'part-time',    type: 'onsite',  salaryType: 'hourly', min: 400, max: 600,   requirements: 'Confident speaker, outgoing personality, basic English skills, own transport preferred, previous promo experience is a plus.', workType: 'daily', shiftDuration: 480, workersNeeded: 4 },
  { employer: 0, title: 'Event Usher - Concert',            category: 'part-time',    type: 'onsite',  salaryType: 'hourly', min: 500, max: 700,   requirements: 'Well-groomed appearance, good communication skills, ability to handle crowds, punctual, available on weekends.', workType: 'one-time', shiftDuration: 360, workersNeeded: 8 },
  // Education → tutoring
  { employer: 1, title: 'Mathematics Tutor (Grade 6-11)',   category: 'tutoring',     type: 'onsite',  salaryType: 'hourly', min: 800, max: 1200,  requirements: 'Pass in A/L Mathematics, teaching ability, patience with students, own transport, available after school hours.', workType: 'flexible', shiftDuration: 120, workersNeeded: 2 },
  { employer: 2, title: 'English Language Instructor',      category: 'tutoring',     type: 'onsite',  salaryType: 'hourly', min: 700, max: 1000,  requirements: 'Fluent in English (spoken & written), basic teaching certification preferred, friendly and approachable, minimum A/L qualification.', workType: 'flexible', shiftDuration: 90, workersNeeded: 3 },
  // Office Support → admin
  { employer: 0, title: 'Data Entry Assistant',             category: 'admin',        type: 'onsite',  salaryType: 'monthly', min: 25000, max: 35000, requirements: 'Typing speed of 40+ WPM, MS Excel knowledge, attention to detail, ability to work under deadline, O/L合格.', workType: 'daily', shiftDuration: 480, workersNeeded: 2 },
  { employer: 1, title: 'Front Desk Receptionist',          category: 'admin',        type: 'onsite',  salaryType: 'monthly', min: 28000, max: 38000, requirements: 'Pleasant personality, professional appearance, phone etiquette, basic computer skills, bilingual preferred.', workType: 'daily', shiftDuration: 480, workersNeeded: 1 },
  // Delivery & Transport → delivery
  { employer: 2, title: 'Food Delivery Rider',              category: 'delivery',     type: 'onsite',  salaryType: 'daily', min: 1500, max: 2500, requirements: 'Valid driving license for motorcycle, own bike with insurance, knowledge of local roads, smartphone with data, punctual.', workType: 'daily', shiftDuration: 480, workersNeeded: 5 },
  { employer: 0, title: 'Package Delivery Driver',          category: 'delivery',     type: 'onsite',  salaryType: 'hourly', min: 500, max: 700,  requirements: 'Valid driving license (LM/B), clean driving record, ability to lift 20kg, navigation skills, professional attitude.', workType: 'daily', shiftDuration: 480, workersNeeded: 2 },
  // Retail → retail
  { employer: 1, title: 'Retail Sales Assistant',           category: 'retail',       type: 'onsite',  salaryType: 'hourly', min: 350, max: 500,   requirements: 'Customer service skills, cash handling experience, ability to work on weekends, basic English, presentable appearance.', workType: 'daily', shiftDuration: 480, workersNeeded: 4 },
  { employer: 2, title: 'Stock Clerk - Supermarket',        category: 'retail',       type: 'onsite',  salaryType: 'hourly', min: 400, max: 550,   requirements: 'Physically fit, organized, ability to use barcode scanners, teamwork, flexible with shifts including weekends.', workType: 'daily', shiftDuration: 480, workersNeeded: 3 },
  // Hotel & Tourism → food-service
  { employer: 0, title: 'Hotel Housekeeping Staff',         category: 'food-service', type: 'onsite',  salaryType: 'hourly', min: 400, max: 600,   requirements: 'Attention to detail, ability to work fast, hygiene standards knowledge, teamwork, flexible with morning shifts.', workType: 'daily', shiftDuration: 480, workersNeeded: 4 },
  { employer: 1, title: 'Guest Relations Assistant',        category: 'food-service', type: 'onsite',  salaryType: 'monthly', min: 30000, max: 40000, requirements: 'Fluent English, professional appearance, hospitality skills, knowledge of local tourist attractions, problem-solving ability.', workType: 'daily', shiftDuration: 480, workersNeeded: 2 },
  // Freelance / Skill → freelance
  { employer: 2, title: 'Graphic Designer (Social Media)',  category: 'freelance',    type: 'remote',  salaryType: 'fixed',  min: 15000, max: 30000, requirements: 'Proficiency in Adobe Photoshop & Illustrator, portfolio required, ability to create social media posts, good communication skills, meeting deadlines.', workType: 'flexible', shiftDuration: 0, workersNeeded: 1 },
  { employer: 0, title: 'Content Writer (English/Sinhala)', category: 'freelance',    type: 'remote',  salaryType: 'fixed',  min: 5000, max: 10000, requirements: 'Excellent writing skills in English and/or Sinhala, ability to research topics, original content creation, meet deadlines, sample articles required.', workType: 'flexible', shiftDuration: 0, workersNeeded: 2 },
];

const sampleSkills = [
  { name: 'Customer Service', category: 'customer-service' },
  { name: 'Communication', category: 'soft-skills' },
  { name: 'Teamwork', category: 'soft-skills' },
  { name: 'Time Management', category: 'soft-skills' },
  { name: 'Microsoft Office', category: 'technical' },
  { name: 'Graphic Design', category: 'design' },
  { name: 'Content Writing', category: 'writing' },
  { name: 'Social Media Marketing', category: 'marketing' },
  { name: 'Driving', category: 'technical' },
  { name: 'Cash Handling', category: 'retail' },
  { name: 'Teaching', category: 'education' },
  { name: 'Photography', category: 'creative' },
  { name: 'Public Speaking', category: 'soft-skills' },
  { name: 'Stock Management', category: 'retail' },
  { name: 'Housekeeping', category: 'hospitality' },
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
      `INSERT IGNORE INTO jobs (employer_id, title, description, requirements, category, job_type, salary_type, salary_min, salary_max, location, status, work_type, shift_duration, workers_needed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)`,
      [
        employerIds[j.employer],
        j.title,
        `Description for ${j.title}. This is a great opportunity for students looking to earn and gain experience.`,
        j.requirements,
        j.category,
        j.type,
        j.salaryType,
        j.min,
        j.max,
        'Colombo, Sri Lanka',
        j.workType,
        j.shiftDuration,
        j.workersNeeded,
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
