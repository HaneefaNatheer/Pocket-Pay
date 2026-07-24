import React from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase } from 'react-icons/fa';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiLinkedin, FiInstagram } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light pt-5 pb-3 mt-auto">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <FaBriefcase className="text-primary me-2" size={24} />
              <h5 className="fw-bold mb-0">StudentConnect</h5>
            </div>
            <p className="text-secondary small">
              Bridging the gap between talented students and forward-thinking employers.
              Find internships, entry-level positions, and start your career journey today.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-secondary fs-5 hover-light">
                <FiFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-secondary fs-5 hover-light">
                <FiTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-secondary fs-5 hover-light">
                <FiLinkedin />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-secondary fs-5 hover-light">
                <FiInstagram />
              </a>
            </div>
          </div>

          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold mb-3">Quick Links</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-secondary text-decoration-none small hover-light">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/jobs" className="text-secondary text-decoration-none small hover-light">Jobs</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-secondary text-decoration-none small hover-light">About</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-secondary text-decoration-none small hover-light">Contact</Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy-policy" className="text-secondary text-decoration-none small hover-light">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3">Contact Info</h6>
            <ul className="list-unstyled">
              <li className="d-flex align-items-start mb-2">
                <FiMail className="text-primary me-2 mt-1" />
                <a href="mailto:info@studentconnect.com" className="text-secondary text-decoration-none small hover-light">
                  info@studentconnect.com
                </a>
              </li>
              <li className="d-flex align-items-start mb-2">
                <FiPhone className="text-primary me-2 mt-1" />
                <a href="tel:+1234567890" className="text-secondary text-decoration-none small hover-light">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="d-flex align-items-start mb-2">
                <FiMapPin className="text-primary me-2 mt-1" />
                <span className="text-secondary small">
                  123 University Ave, Tech City, TC 10001
                </span>
              </li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold mb-3">Newsletter</h6>
            <p className="text-secondary small">
              Stay updated with the latest job opportunities and career tips.
            </p>
            <form className="d-flex mt-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                className="form-control form-control-sm bg-dark text-light border-secondary"
                placeholder="Your email"
              />
              <button type="submit" className="btn btn-primary btn-sm ms-2 px-3">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <hr className="border-secondary mt-4 mb-3" />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="small text-secondary mb-0">
              &copy; {currentYear} StudentConnect. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <Link to="/privacy-policy" className="text-secondary text-decoration-none small me-3 hover-light">
              Privacy
            </Link>
            <Link to="/terms" className="text-secondary text-decoration-none small me-3 hover-light">
              Terms
            </Link>
            <Link to="/cookie-policy" className="text-secondary text-decoration-none small hover-light">
              Cookies
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .hover-light:hover { color: #fff !important; }
      `}</style>
    </footer>
  );
};

export default Footer;
