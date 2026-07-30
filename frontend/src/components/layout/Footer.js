import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';
import pocketPayLogo from '../../assets/images/pocket-pay-logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: '#111827' }} className="pt-3 pb-3 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <img src={pocketPayLogo} alt="Pocket-Pay" style={{ height: 40, width: 'auto' }} className="me-2" />
              <h5 className="fw-bold mb-0" style={{ color: '#ffffff' }}>Pocket-Pay</h5>
            </div>
            <p style={{ color: '#9ca3af' }} className="small mb-3">
              Bridging the gap between talented students and forward-thinking employers.
              Find internships, entry-level positions, and start your career journey today.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social" style={{ color: '#9ca3af' }}>
                <FiFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social" style={{ color: '#9ca3af' }}>
                <FiTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social" style={{ color: '#9ca3af' }}>
                <FiLinkedin />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social" style={{ color: '#9ca3af' }}>
                <FiInstagram />
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3" style={{ color: '#ffffff' }}>Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="footer-link">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/jobs" className="footer-link">Jobs</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="footer-link">About</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="footer-link">Contact</Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3" style={{ color: '#ffffff' }}>Contact Info</h6>
            <ul className="list-unstyled">
              <li className="d-flex align-items-start mb-2">
                <FiMail style={{ color: '#a78bfa' }} className="me-2 mt-1" />
                <a href="mailto:pocketpayofficial@gmail.com" className="footer-link">
                  pocketpayofficial@gmail.com
                </a>
              </li>
              <li className="d-flex align-items-start mb-2">
                <FiPhone style={{ color: '#a78bfa' }} className="me-2 mt-1" />
                <a href="tel:+94778797107" className="footer-link">
                  0778 797 107
                </a>
              </li>
              <li className="d-flex align-items-start mb-2">
                <FiMapPin style={{ color: '#a78bfa' }} className="me-2 mt-1" />
                <span style={{ color: '#9ca3af' }} className="small">
                  Yakkala, Gampaha, Sri Lanka
                </span>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3" style={{ color: '#ffffff' }}>Newsletter</h6>
            <p style={{ color: '#9ca3af' }} className="small">
              Stay updated with the latest job opportunities and career tips.
            </p>
            <form className="d-flex mt-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                className="form-control form-control-sm"
                placeholder="Your email"
                style={{ background: '#1f2937', color: '#ffffff', border: '1px solid #374151' }}
              />
              <button type="submit" className="btn btn-sm ms-2 px-3" style={{ background: '#7c3aed', color: '#ffffff', border: 'none' }}>
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <hr style={{ borderColor: '#374151' }} className="mt-4 mb-3" />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="small mb-0" style={{ color: '#9ca3af' }}>
              &copy; {currentYear} Pocket-Pay. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <Link to="/privacy-policy" className="footer-bottom-link me-3">Privacy</Link>
            <Link to="/terms" className="footer-bottom-link me-3">Terms</Link>
            <Link to="/cookie-policy" className="footer-bottom-link">Cookies</Link>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link {
          color: #9ca3af !important;
          text-decoration: none !important;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: #ffffff !important;
        }
        .footer-social {
          font-size: 1.25rem;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .footer-social:hover {
          color: #a78bfa !important;
          transform: translateY(-2px);
        }
        .footer-bottom-link {
          color: #9ca3af !important;
          text-decoration: none !important;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }
        .footer-bottom-link:hover {
          color: #ffffff !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
