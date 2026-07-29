# Student Part-Time Job Connect System

A full-stack web application that connects university students with trusted employers offering part-time jobs and internship opportunities.

## Tech Stack

| Layer       | Technology                                    |
| ----------- | --------------------------------------------- |
| Frontend    | React.js, Bootstrap 5, React Router, Chart.js |
| Backend     | Node.js, Express.js                           |
| Database    | MySQL (Sequelize ORM)                         |
| Auth        | JWT (JSON Web Tokens), bcrypt                 |
| File Upload | Multer                                        |
| Email       | Nodemailer                                    |
| Maps        | Google Maps API                               |

## Features

### Student

- Register/Login with JWT Authentication
- Edit Profile, Upload Profile Picture & CV
- Manage Skills and Weekly Timetable
- Search & Filter Jobs (category, salary, location, skills)
- Save Favourite Jobs
- Apply for Jobs & Track Application Status
- View Recommended Jobs (timetable + skill matching)
- View Nearby Jobs (Google Maps)
- Receive Notifications

### Employer

- Register Company & Login
- Edit Company Profile, Upload Logo
- Post, Edit, Delete Jobs
- View Applicants & Download CVs
- Accept/Reject Applications
- Schedule Interviews & Send Email Invitations
- Verified Employer Badge

### Admin

- Dashboard with Analytics Charts (Chart.js)
- Manage Students & Employers
- Verify Employers
- Remove Fake Jobs
- Manage Reports & Reviews
- Block/Unblock Users
- View System Logs

## Project Structure

```
Pocket-Pay/
├── backend/
│   ├── config/          # Database & app configuration
│   ├── controllers/     # Route handlers (MVC Controllers)
│   ├── database/        # SQL schema & seed scripts
│   ├── middleware/       # Auth, error, upload, validation
│   ├── models/          # Sequelize models
│   ├── routes/          # Express routes
│   ├── services/        # Email & notification services
│   ├── uploads/         # Uploaded files (profiles, CV, logos)
│   ├── utils/           # Helper functions & constants
│   ├── views/           # Email templates
│   ├── public/          # Static assets
│   ├── server.js        # Entry point
│   ├── package.json
│   └── .env             # Environment variables
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/css/  # Custom styles
│   │   ├── components/  # Reusable components
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── admin/
│   │   │   ├── employer/
│   │   │   └── student/
│   │   ├── context/     # React contexts (Auth, Theme)
│   │   ├── hooks/       # Custom hooks
│   │   ├── pages/       # Page components
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   ├── employer/
│   │   │   └── admin/
│   │   ├── services/    # API service layer
│   │   ├── utils/       # Helper functions
│   │   ├── App.js       # Main app with routes
│   │   └── index.js     # Entry point
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL (v8+)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MySQL credentials and API keys

# Create database and seed data
npm run seed

# Start development server
npm run dev
```

Server runs on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm start
```

Frontend runs on http://localhost:3000

### Default Credentials

| Role     | Email                | Password     |
| -------- | -------------------- | ------------ |
| Admin    | admin@jobconnect.com | Password@123 |
| Student  | student1@test.com    | Password@123 |
| Employer | employer1@test.com   | Password@123 |

## API Endpoints

### Authentication

| Method | Endpoint                        | Description       |
| ------ | ------------------------------- | ----------------- |
| POST   | /api/auth/register              | Register new user |
| POST   | /api/auth/login                 | Login             |
| POST   | /api/auth/logout                | Logout            |
| POST   | /api/auth/forgot-password       | Forgot password   |
| POST   | /api/auth/reset-password/:token | Reset password    |
| GET    | /api/auth/verify-email/:token   | Verify email      |
| GET    | /api/auth/me                    | Get current user  |

### Jobs

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| GET    | /api/jobs          | Get all jobs          |
| GET    | /api/jobs/:id      | Get job by ID         |
| POST   | /api/jobs          | Create job (employer) |
| PUT    | /api/jobs/:id      | Update job (employer) |
| DELETE | /api/jobs/:id      | Delete job            |
| GET    | /api/jobs/search   | Advanced search       |
| POST   | /api/jobs/:id/save | Save job (student)    |
| DELETE | /api/jobs/:id/save | Unsave job            |

### Applications

| Method | Endpoint                          | Description        |
| ------ | --------------------------------- | ------------------ |
| POST   | /api/applications                 | Apply for job      |
| GET    | /api/applications/my-applications | My applications    |
| PUT    | /api/applications/:id/status      | Update status      |
| PUT    | /api/applications/:id/interview   | Schedule interview |

## Security

- JWT Authentication with refresh tokens
- Password hashing with bcrypt (10 rounds)
- Helmet.js for HTTP headers security
- Rate limiting (100 requests per 15 minutes)
- Input validation with express-validator
- CORS configuration
- SQL injection prevention (Sequelize ORM)
- XSS protection
- Environment variables for secrets

## License

This project is for educational purposes (3rd Year HICT Web Application Develop Project).
