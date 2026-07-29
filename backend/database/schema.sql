CREATE DATABASE IF NOT EXISTS student_job_connect;
USE student_job_connect;

-- ============================================================
-- Users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)   NOT NULL,
  email         VARCHAR(150)   NOT NULL UNIQUE,
  password      VARCHAR(255)   NOT NULL,
  role          ENUM('student','employer','admin') NOT NULL DEFAULT 'student',
  phone         VARCHAR(20)    DEFAULT NULL,
  profile_picture VARCHAR(255) DEFAULT NULL,
  is_verified   TINYINT(1)     NOT NULL DEFAULT 0,
  is_active     TINYINT(1)     NOT NULL DEFAULT 1,
  verification_token  VARCHAR(255) DEFAULT NULL,
  reset_token         VARCHAR(255) DEFAULT NULL,
  reset_token_expire  DATETIME     DEFAULT NULL,
  last_login    DATETIME       DEFAULT NULL,
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at    DATETIME       DEFAULT NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Students
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT          NOT NULL UNIQUE,
  university          VARCHAR(200) DEFAULT NULL,
  degree              VARCHAR(200) DEFAULT NULL,
  year_of_study       INT          DEFAULT NULL,
  date_of_birth       DATE         DEFAULT NULL,
  address             TEXT         DEFAULT NULL,
  latitude            DECIMAL(10,8) DEFAULT NULL,
  longitude           DECIMAL(11,8) DEFAULT NULL,
  cv_file             VARCHAR(255) DEFAULT NULL,
  bio                 TEXT         DEFAULT NULL,
  preferred_salary_min DECIMAL(10,2) DEFAULT NULL,
  preferred_salary_max DECIMAL(10,2) DEFAULT NULL,
  preferred_location  VARCHAR(255) DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME DEFAULT NULL,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Employers
-- ============================================================
CREATE TABLE IF NOT EXISTS employers (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  user_id                 INT          NOT NULL UNIQUE,
  company_name            VARCHAR(200) NOT NULL,
  company_description     TEXT         DEFAULT NULL,
  company_logo            VARCHAR(255) DEFAULT NULL,
  company_website         VARCHAR(255) DEFAULT NULL,
  company_email           VARCHAR(150) DEFAULT NULL,
  company_phone           VARCHAR(20)  DEFAULT NULL,
  company_address         TEXT         DEFAULT NULL,
  industry                VARCHAR(100) DEFAULT NULL,
  company_size            VARCHAR(50)  DEFAULT NULL,
  latitude                DECIMAL(10,8) DEFAULT NULL,
  longitude               DECIMAL(11,8) DEFAULT NULL,
  is_verified             TINYINT(1)   NOT NULL DEFAULT 0,
  verified_at             DATETIME     DEFAULT NULL,
  verification_documents  VARCHAR(255) DEFAULT NULL,
  total_jobs_posted       INT          NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME DEFAULT NULL,
  CONSTRAINT fk_employers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Admins
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT  NOT NULL UNIQUE,
  role_level   ENUM('super_admin','moderator') NOT NULL DEFAULT 'moderator',
  last_action  TEXT DEFAULT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  employer_id           INT          NOT NULL,
  title                 VARCHAR(200) NOT NULL,
  description           TEXT         NOT NULL,
  requirements          TEXT         DEFAULT NULL,
  category              ENUM('internship','part-time','freelance','remote','tutoring','delivery','retail','food-service','admin','tech','creative','other') NOT NULL DEFAULT 'part-time',
  job_type              ENUM('onsite','remote','hybrid') DEFAULT 'onsite',
  salary_min            DECIMAL(10,2) DEFAULT NULL,
  salary_max            DECIMAL(10,2) DEFAULT NULL,
  salary_type           ENUM('hourly','daily','weekly','monthly','fixed') DEFAULT 'hourly',
  location              VARCHAR(255) DEFAULT NULL,
  latitude              DECIMAL(10,8) DEFAULT NULL,
  longitude             DECIMAL(11,8) DEFAULT NULL,
  required_skills       JSON         DEFAULT NULL,
  available_days        JSON         DEFAULT NULL,
  available_hours_start TIME         DEFAULT NULL,
  available_hours_end   TIME         DEFAULT NULL,
  shift_duration        INT          DEFAULT NULL COMMENT 'Shift length in minutes',
  workers_needed        INT          NOT NULL DEFAULT 1,
  workers_hired         INT          NOT NULL DEFAULT 0,
  is_recurring          TINYINT(1)   NOT NULL DEFAULT 0 COMMENT 'Daily/ongoing work',
  work_type             ENUM('daily','weekly','one-time','flexible','as-needed') NOT NULL DEFAULT 'one-time',
  benefits              TEXT         DEFAULT NULL,
  contact_person        VARCHAR(200) DEFAULT NULL,
  contact_phone         VARCHAR(50)  DEFAULT NULL,
  contact_email         VARCHAR(200) DEFAULT NULL,
  required_documents    JSON         DEFAULT NULL,
  max_applicants        INT          NOT NULL DEFAULT 50,
  current_applicants    INT          NOT NULL DEFAULT 0,
  deadline              DATETIME     DEFAULT NULL,
  status                ENUM('active','closed','expired','draft') NOT NULL DEFAULT 'active',
  is_urgent             TINYINT(1)   NOT NULL DEFAULT 0,
  views_count           INT          NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME DEFAULT NULL,
  CONSTRAINT fk_jobs_employer FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE,
  INDEX idx_jobs_employer_id (employer_id),
  INDEX idx_jobs_status      (status),
  INDEX idx_jobs_category    (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Applications
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  student_id        INT  NOT NULL,
  job_id            INT  NOT NULL,
  cover_letter      TEXT DEFAULT NULL,
  status            ENUM('pending','reviewed','shortlisted','interview','accepted','rejected') NOT NULL DEFAULT 'pending',
  employer_notes    TEXT DEFAULT NULL,
  student_notes     TEXT DEFAULT NULL,
  interview_date    DATETIME     DEFAULT NULL,
  interview_location VARCHAR(255) DEFAULT NULL,
  applied_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at       DATETIME DEFAULT NULL,
  responded_at      DATETIME DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at  DATETIME DEFAULT NULL,
  CONSTRAINT fk_applications_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_applications_job     FOREIGN KEY (job_id)     REFERENCES jobs(id)     ON DELETE CASCADE,
  UNIQUE KEY uk_application (student_id, job_id),
  INDEX idx_applications_student_id (student_id),
  INDEX idx_applications_job_id     (job_id),
  INDEX idx_applications_status     (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Saved Jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_jobs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  job_id     INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_saved_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_saved_job     FOREIGN KEY (job_id)     REFERENCES jobs(id)     ON DELETE CASCADE,
  UNIQUE KEY uk_saved (student_id, job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT         NOT NULL,
  type       ENUM('application','job','system','interview') NOT NULL,
  is_read    TINYINT(1)   NOT NULL DEFAULT 0,
  link       VARCHAR(255) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notifications_user_id (user_id),
  INDEX idx_notifications_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Timetables
-- ============================================================
CREATE TABLE IF NOT EXISTS timetables (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  student_id  INT  NOT NULL,
  day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL,
  is_busy     TINYINT(1)   NOT NULL DEFAULT 1,
  subject     VARCHAR(200) DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_timetables_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  INDEX idx_timetables_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Skills
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE,
  category  VARCHAR(100) DEFAULT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- User Skills
-- ============================================================
CREATE TABLE IF NOT EXISTS user_skills (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT  NOT NULL,
  skill_id    INT  NOT NULL,
  proficiency ENUM('beginner','intermediate','advanced','expert') NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_userskills_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  CONSTRAINT fk_userskills_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_skill (user_id, skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Reviews
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  student_id  INT  NOT NULL,
  employer_id INT  NOT NULL,
  rating      INT  NOT NULL,
  comment     TEXT DEFAULT NULL,
  is_visible  TINYINT(1) NOT NULL DEFAULT 1,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reviews_student  FOREIGN KEY (student_id)  REFERENCES students(id)  ON DELETE CASCADE,
  CONSTRAINT fk_reviews_employer FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE,
  CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5),
  INDEX idx_reviews_employer_id (employer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Reports
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id  INT  NOT NULL,
  reported_id  INT  DEFAULT NULL,
  job_id       INT  DEFAULT NULL,
  type         ENUM('fake_job','inappropriate','scam','harassment','other') NOT NULL,
  description  TEXT NOT NULL,
  status       ENUM('pending','investigating','resolved','dismissed') NOT NULL DEFAULT 'pending',
  admin_notes  TEXT DEFAULT NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_reported FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_reports_job      FOREIGN KEY (job_id)      REFERENCES jobs(id)  ON DELETE SET NULL,
  INDEX idx_reports_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Contact Messages
-- ============================================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL,
  subject     VARCHAR(200) NOT NULL,
  message     TEXT         NOT NULL,
  is_resolved TINYINT(1)   NOT NULL DEFAULT 0,
  admin_reply TEXT         DEFAULT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_contact_email      (email),
  INDEX idx_contact_is_resolved (is_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Default Admin User  (password: Admin@123)
-- ============================================================
INSERT INTO users (name, email, password, role, is_verified, is_active)
VALUES (
  'System Admin',
  'admin@jobconnect.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  1,
  1
);

INSERT INTO admins (user_id, role_level)
SELECT id, 'super_admin' FROM users WHERE email = 'admin@jobconnect.com';
