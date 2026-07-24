import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Badge, Dropdown, Button } from 'react-bootstrap';
import { FaBriefcase } from 'react-icons/fa';
import { FiSun, FiMoon, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { notificationService } from '../../services/notificationService';
import NotificationBell from '../common/NotificationBell';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const closeNav = () => setExpanded(false);

  const handleLogout = () => {
    logout();
    closeNav();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path) => ({ isActive }) =>
    isActive ? 'nav-link active' : 'nav-link';

  return (
    <BSNavbar
      expand="lg"
      className={`navbar-custom sticky-top ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-white'} shadow-sm`}
      expanded={expanded}
      onToggle={(val) => setExpanded(val)}
    >
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="d-flex align-items-center fw-bold" onClick={closeNav}>
          <FaBriefcase className="me-2 text-primary" size={24} />
          <span className="brand-text">StudentConnect</span>
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="main-navbar" />

        <BSNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <NavLink to="/" className={isActive('/')} onClick={closeNav}>Home</NavLink>
            <NavLink to="/jobs" className={isActive('/jobs')} onClick={closeNav}>Jobs</NavLink>
            <NavLink to="/about" className={isActive('/about')} onClick={closeNav}>About</NavLink>
            <NavLink to="/contact" className={isActive('/contact')} onClick={closeNav}>Contact</NavLink>

            {isAuthenticated && user?.role === 'student' && (
              <>
                <NavLink to="/student/dashboard" className={isActive('/student/dashboard')} onClick={closeNav}>
                  Dashboard
                </NavLink>
                <NavLink to="/student/saved-jobs" className={isActive('/student/saved-jobs')} onClick={closeNav}>
                  Saved Jobs
                </NavLink>
                <NavLink to="/student/applied-jobs" className={isActive('/student/applied-jobs')} onClick={closeNav}>
                  Applied Jobs
                </NavLink>
              </>
            )}

            {isAuthenticated && user?.role === 'employer' && (
              <>
                <NavLink to="/employer/dashboard" className={isActive('/employer/dashboard')} onClick={closeNav}>
                  Dashboard
                </NavLink>
                <NavLink to="/employer/post-job" className={isActive('/employer/post-job')} onClick={closeNav}>
                  Post Job
                </NavLink>
                <NavLink to="/employer/manage-jobs" className={isActive('/employer/manage-jobs')} onClick={closeNav}>
                  Manage Jobs
                </NavLink>
              </>
            )}

            {isAuthenticated && user?.role === 'admin' && (
              <>
                <NavLink to="/admin/dashboard" className={isActive('/admin/dashboard')} onClick={closeNav}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/students" className={isActive('/admin/students')} onClick={closeNav}>
                  Students
                </NavLink>
                <NavLink to="/admin/employers" className={isActive('/admin/employers')} onClick={closeNav}>
                  Employers
                </NavLink>
                <NavLink to="/admin/jobs" className={isActive('/admin/jobs')} onClick={closeNav}>
                  Jobs
                </NavLink>
                <NavLink to="/admin/reports" className={isActive('/admin/reports')} onClick={closeNav}>
                  Reports
                </NavLink>
              </>
            )}
          </Nav>

          <Nav className="d-flex align-items-center gap-2">
            <Button
              variant="link"
              className="nav-link p-1"
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </Button>

            {isAuthenticated ? (
              <>
                <NotificationBell />

                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    className="nav-link d-flex align-items-center text-decoration-none dropdown-toggle-no-arrow"
                    id="user-dropdown"
                  >
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="rounded-circle me-2"
                        style={{ width: 32, height: 32, objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle me-2 d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
                        style={{ width: 32, height: 32, fontSize: '0.75rem' }}
                      >
                        {getInitials(user?.name)}
                      </div>
                    )}
                    <span className="d-none d-lg-inline">{user?.name}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow-sm border-0">
                    <Dropdown.Header>
                      <div className="fw-semibold">{user?.name}</div>
                      <small className="text-muted text-capitalize">{user?.role}</small>
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to={`/${user?.role}/profile`} onClick={closeNav}>
                      <FiUser className="me-2" /> Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to={`/${user?.role}/dashboard`} onClick={closeNav}>
                      <FiSettings className="me-2" /> Dashboard
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      <FiLogOut className="me-2" /> Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="btn btn-outline-primary btn-sm"
                  onClick={closeNav}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="btn btn-primary btn-sm"
                  onClick={closeNav}
                >
                  Register
                </NavLink>
              </>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
