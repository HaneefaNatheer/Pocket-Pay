import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';

// Auth Pages
import StudentLogin from './pages/auth/StudentLogin';
import EmployerLogin from './pages/auth/EmployerLogin';
import AdminLogin from './pages/auth/AdminLogin';
import StudentRegister from './pages/auth/StudentRegister';
import EmployerRegister from './pages/auth/EmployerRegister';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import JobList from './pages/student/JobList';
import JobDetails from './pages/student/JobDetails';
import SavedJobs from './pages/student/SavedJobs';
import AppliedJobs from './pages/student/AppliedJobs';
import StudentTimetable from './pages/student/StudentTimetable';
import StudentSkills from './pages/student/StudentSkills';

// Employer Pages
import EmployerDashboard from './pages/employer/EmployerDashboard';
import EmployerProfile from './pages/employer/EmployerProfile';
import PostJob from './pages/employer/PostJob';
import EmployerManageJobs from './pages/employer/ManageJobs';
import ViewApplicants from './pages/employer/ViewApplicants';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import ManageEmployers from './pages/admin/ManageEmployers';
import AdminManageJobs from './pages/admin/ManageJobs';
import ManageReports from './pages/admin/ManageReports';
import ManageReviews from './pages/admin/ManageReviews';
import SystemLogs from './pages/admin/SystemLogs';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetails />} />

            {/* Auth Routes */}
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/login/employer" element={<EmployerLogin />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/register" element={<StudentRegister />} />
            <Route path="/register/employer" element={<EmployerRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />

            {/* Student Routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />
            <Route path="/student/saved-jobs" element={<ProtectedRoute allowedRoles={['student']}><SavedJobs /></ProtectedRoute>} />
            <Route path="/student/applied-jobs" element={<ProtectedRoute allowedRoles={['student']}><AppliedJobs /></ProtectedRoute>} />
            <Route path="/student/timetable" element={<ProtectedRoute allowedRoles={['student']}><StudentTimetable /></ProtectedRoute>} />
            <Route path="/student/skills" element={<ProtectedRoute allowedRoles={['student']}><StudentSkills /></ProtectedRoute>} />

            {/* Employer Routes */}
            <Route path="/employer/dashboard" element={<ProtectedRoute allowedRoles={['employer']}><EmployerDashboard /></ProtectedRoute>} />
            <Route path="/employer/profile" element={<ProtectedRoute allowedRoles={['employer']}><EmployerProfile /></ProtectedRoute>} />
            <Route path="/employer/post-job" element={<ProtectedRoute allowedRoles={['employer']}><PostJob /></ProtectedRoute>} />
            <Route path="/employer/manage-jobs" element={<ProtectedRoute allowedRoles={['employer']}><EmployerManageJobs /></ProtectedRoute>} />
            <Route path="/employer/applicants/:jobId" element={<ProtectedRoute allowedRoles={['employer']}><ViewApplicants /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><ManageStudents /></ProtectedRoute>} />
            <Route path="/admin/employers" element={<ProtectedRoute allowedRoles={['admin']}><ManageEmployers /></ProtectedRoute>} />
            <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageJobs /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><ManageReports /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['admin']}><ManageReviews /></ProtectedRoute>} />
            <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><SystemLogs /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
