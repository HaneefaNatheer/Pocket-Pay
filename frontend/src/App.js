import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import StudentServices from './pages/StudentServices';
import EmployerServices from './pages/EmployerServices';
import Contact from './pages/Contact';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import AdminLogin from './pages/auth/AdminLogin';
import StudentRegister from './pages/auth/StudentRegister';
import EmployerRegister from './pages/auth/EmployerRegister';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentProfileSetup from './pages/student/StudentProfileSetup';
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

// Shared Pages
import NotificationsPage from './pages/NotificationsPage';

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

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  if (loading) return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;
  if (user && !showModal) {
    setShowModal(true);
    return null;
  }
  if (showModal) {
    const dashboard = user.role === 'student' ? '/student/dashboard' : user.role === 'employer' ? '/employer/dashboard' : '/admin/dashboard';
    const roleName = user.role === 'student' ? 'Student' : user.role === 'employer' ? 'Employer' : 'Admin';
    return (
      <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
            <div className="modal-body text-center p-4">
              <div className="mb-3" style={{ fontSize: '3rem' }}>🔒</div>
              <h5 className="fw-bold mb-2">Already Logged In</h5>
              <p className="text-muted mb-1">You are currently logged in as <strong>{roleName}</strong>.</p>
              <p className="text-muted mb-4">Please logout first before creating or accessing a different account.</p>
              <div className="d-flex gap-3 justify-content-center">
                <button className="btn btn-outline-secondary px-4" onClick={() => navigate(dashboard)}>Go to Dashboard</button>
                <button className="btn btn-primary px-4" onClick={() => { localStorage.removeItem('token'); window.location.href = '/register'; }}>Logout & Continue</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return children;
};

// Role Guard — shows popup if logged-in user visits wrong role page
const RoleGuard = ({ allowedRole, children }) => {
  const { user } = useAuth();
  const [show, setShow] = useState(true);

  if (!user || user.role === allowedRole) return children;

  if (!show) return <Navigate to="/" />;

  return (
    <>
      {children}
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: '#fff', borderRadius: 16, maxWidth: 400, width: '100%', padding: '2rem', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: user.role === 'student' ? '#fef2f2' : '#eff6ff', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>
            {user.role === 'student' ? '🎓' : '💼'}
          </div>
          <h5 className="fw-bold mb-2">
            {user.role === 'student'
              ? 'Student Account Detected'
              : 'Employer Account Detected'}
          </h5>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            {user.role === 'student'
              ? 'You are logged in as a Student. You cannot access the Employer page. Please use the Student Services page.'
              : 'You are logged in as an Employer. You cannot access the Student page. Please use the Employer Services page.'}
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <button
              className="btn rounded-pill px-4 fw-semibold"
              style={{ background: user.role === 'student' ? '#7c3aed' : '#2563eb', color: '#fff' }}
              onClick={() => {
                setShow(false);
                window.location.href = user.role === 'student' ? '/services/student' : '/services/employer';
              }}
            >
              {user.role === 'student' ? 'Go to Student Services' : 'Go to Employer Services'}
            </button>
            <button
              className="btn rounded-pill px-4 fw-semibold"
              style={{ background: '#f1f5f9', color: '#475569' }}
              onClick={() => { setShow(false); window.location.href = '/'; }}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const hideFooterRoutes = ['/login', '/register', '/forgot-password'];

function AppContent() {
  const location = useLocation();
  const showFooter = !hideFooterRoutes.some(r => location.pathname.startsWith(r));

  return (
    <div className="App d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/student" element={<RoleGuard allowedRole="student"><StudentServices /></RoleGuard>} />
          <Route path="/services/employer" element={<RoleGuard allowedRole="employer"><EmployerServices /></RoleGuard>} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Auth Routes */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/login/employer" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/login/admin" element={<GuestRoute><AdminLogin /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/register/student" element={<GuestRoute><StudentRegister /></GuestRoute>} />
          <Route path="/register/employer" element={<GuestRoute><EmployerRegister /></GuestRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Student Routes */}
          <Route path="/student/profile-setup" element={<ProtectedRoute allowedRoles={['student']}><StudentProfileSetup /></ProtectedRoute>} />
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

          {/* Shared Routes */}
          <Route path="/notifications" element={<ProtectedRoute allowedRoles={['student', 'employer']}><NotificationsPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><ManageStudents /></ProtectedRoute>} />
          <Route path="/admin/employers" element={<ProtectedRoute allowedRoles={['admin']}><ManageEmployers /></ProtectedRoute>} />
          <Route path="/admin/jobs" element={<ProtectedRoute allowedRoles={['admin']}><AdminManageJobs /></ProtectedRoute>} />
          <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><ManageReports /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['admin']}><ManageReviews /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><SystemLogs /></ProtectedRoute>} />

          {/* 404 */}
          <Route path="*" element={<div className="d-flex flex-column align-items-center justify-content-center vh-100"><h1 className="display-1 fw-bold text-muted">404</h1><p className="lead">Page not found</p><a href="/" className="btn btn-primary rounded-3 px-4">Go Home</a></div>} />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
