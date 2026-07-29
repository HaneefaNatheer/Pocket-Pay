import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';
import { FiSun, FiMoon, FiUser, FiLogOut, FiSettings, FiMoreVertical, FiGrid, FiBookmark, FiFileText, FiChevronRight, FiBell } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../common/NotificationBell';
import pocketPayLogo from '../../assets/images/pocket-pay-logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [dotOpen, setDotOpen] = useState(false);
  const dotRef = useRef(null);

  const closeNav = () => setExpanded(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dotRef.current && !dotRef.current.contains(e.target)) {
        setDotOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const navLinkClass = ({ isActive }) =>
    `pp-nav-link ${isActive ? 'active' : ''}`;

  const theme = darkMode ? 'dark' : 'light';

  return (
    <BSNavbar
      expand="lg"
      data-theme={theme}
      className="navbar-custom sticky-top shadow-sm"
      expanded={expanded}
      onToggle={(val) => setExpanded(val)}
    >
      <Container>
        <BSNavbar.Brand as={Link} to="/" className="pp-brand" onClick={closeNav}>
          <img src={pocketPayLogo} alt="Pocket-Pay" style={{ height: 44, width: 'auto' }} />
          <span className="pp-brand-text">Pocket-Pay</span>
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="main-navbar" />

        <BSNavbar.Collapse id="main-navbar">
          <Nav className="me-auto">
            <NavLink to="/" className={navLinkClass} onClick={closeNav}>Home</NavLink>
            <NavLink to="/services" className={navLinkClass} onClick={closeNav}>Services</NavLink>
            <NavLink to="/about" className={navLinkClass} onClick={closeNav}>About</NavLink>
            <NavLink to="/contact" className={navLinkClass} onClick={closeNav}>Contact</NavLink>
          </Nav>

          <Nav className="pp-right-section">
            <Button
              variant="link"
              className="pp-theme-toggle"
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
            </Button>

            {isAuthenticated ? (
              <>
                <NotificationBell />

                <div className="pp-dot-menu-wrapper" ref={dotRef}>
                  <button className="pp-dot-toggle" onClick={() => setDotOpen(!dotOpen)}>
                    <FiMoreVertical size={20} />
                  </button>

                  {dotOpen && (
                    <div className="pp-dot-dropdown shadow-lg">
                      <div className="pp-dot-header">
                        <div className="pp-dot-avatar">
                          {user?.profile_picture ? (
                            <img
                              src={`http://localhost:5000/${user.profile_picture}`}
                              alt={user.name}
                            />
                          ) : (
                            <span>{getInitials(user?.name)}</span>
                          )}
                        </div>
                        <div className="pp-dot-user-info">
                          <div className="pp-dot-name">{user?.name}</div>
                          <div className="pp-dot-role">{user?.role}</div>
                        </div>
                      </div>

                      <div className="pp-dot-divider" />

                      {user?.role === 'student' && (
                        <>
                          <Link to="/student/dashboard" className="pp-dot-item" onClick={() => { setDotOpen(false); closeNav(); }}>
                            <FiGrid className="pp-dot-icon" />
                            <span>Dashboard</span>
                            <FiChevronRight className="pp-dot-arrow" />
                          </Link>
                          <Link to="/student/saved-jobs" className="pp-dot-item" onClick={() => { setDotOpen(false); closeNav(); }}>
                            <FiBookmark className="pp-dot-icon" />
                            <span>Saved Jobs</span>
                            <FiChevronRight className="pp-dot-arrow" />
                          </Link>
                          <Link to="/student/applied-jobs" className="pp-dot-item" onClick={() => { setDotOpen(false); closeNav(); }}>
                            <FiFileText className="pp-dot-icon" />
                            <span>Applied Jobs</span>
                            <FiChevronRight className="pp-dot-arrow" />
                          </Link>
                        </>
                      )}

                      {user?.role === 'employer' && (
                        <>
                          <Link to="/employer/dashboard" className="pp-dot-item" onClick={() => { setDotOpen(false); closeNav(); }}>
                            <FiGrid className="pp-dot-icon" />
                            <span>Dashboard</span>
                            <FiChevronRight className="pp-dot-arrow" />
                          </Link>
                          <Link to="/employer/post-job" className="pp-dot-item" onClick={() => { setDotOpen(false); closeNav(); }}>
                            <FiFileText className="pp-dot-icon" />
                            <span>Post Job</span>
                            <FiChevronRight className="pp-dot-arrow" />
                          </Link>
                          <Link to="/employer/manage-jobs" className="pp-dot-item" onClick={() => { setDotOpen(false); closeNav(); }}>
                            <FiSettings className="pp-dot-icon" />
                            <span>Manage Jobs</span>
                            <FiChevronRight className="pp-dot-arrow" />
                          </Link>
                        </>
                      )}

                      {user?.role === 'admin' && (
                        <>
                          <Link to="/admin/dashboard" className="pp-dot-item" onClick={() => { setDotOpen(false); closeNav(); }}>
                            <FiGrid className="pp-dot-icon" />
                            <span>Dashboard</span>
                            <FiChevronRight className="pp-dot-arrow" />
                          </Link>
                          <Link to="/admin/students" className="pp-dot-item" onClick={() => { setDotOpen(false); closeNav(); }}>
                            <FiUser className="pp-dot-icon" />
                            <span>Students</span>
                            <FiChevronRight className="pp-dot-arrow" />
                          </Link>
                          <Link to="/admin/employers" className="pp-dot-item" onClick={() => { setDotOpen(false); closeNav(); }}>
                            <FiUser className="pp-dot-icon" />
                            <span>Employers</span>
                            <FiChevronRight className="pp-dot-arrow" />
                          </Link>
                          <Link to="/admin/jobs" className="pp-dot-item" onClick={() => { setDotOpen(false); closeNav(); }}>
                            <FiFileText className="pp-dot-icon" />
                            <span>Jobs</span>
                            <FiChevronRight className="pp-dot-arrow" />
                          </Link>
                          <Link to="/admin/reports" className="pp-dot-item" onClick={() => { setDotOpen(false); closeNav(); }}>
                            <FiSettings className="pp-dot-icon" />
                            <span>Reports</span>
                            <FiChevronRight className="pp-dot-arrow" />
                          </Link>
                        </>
                      )}

                      <div className="pp-dot-divider" />

                      <Link to={`/${user?.role}/profile`} className="pp-dot-item" onClick={() => { setDotOpen(false); closeNav(); }}>
                        <FiUser className="pp-dot-icon" />
                        <span>My Profile</span>
                        <FiChevronRight className="pp-dot-arrow" />
                      </Link>

                      <button className="pp-dot-item pp-dot-danger" onClick={handleLogout}>
                        <FiLogOut className="pp-dot-icon" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="pp-auth-buttons">
                <NavLink
                  to="/login"
                  className="pp-btn-login"
                  onClick={closeNav}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="pp-btn-register"
                  onClick={closeNav}
                >
                  Register
                </NavLink>
              </div>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;
