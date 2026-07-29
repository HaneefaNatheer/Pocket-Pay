import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaBriefcase, FaArrowRight, FaRocket } from 'react-icons/fa';

function useScrollAnimation() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, []);
  return [ref, isVisible];
}

function AnimSection({ children, className = '', delay = 0, animation = 'fade-up' }) {
  const [ref, isVisible] = useScrollAnimation();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? 'translateY(0) translateX(0) scale(1)'
          : animation === 'fade-left'
            ? 'translateX(-40px)'
            : animation === 'fade-right'
              ? 'translateX(40px)'
              : animation === 'zoom'
                ? 'scale(0.9)'
                : 'translateY(40px)',
        transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function Services() {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      {/* HERO */}
      <section className="hero-section" style={{ minHeight: '50vh' }}>
        <div className="hero-particles">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }} />
          ))}
        </div>
        <div className="container position-relative d-flex align-items-center" style={{ minHeight: '50vh' }}>
          <div className="row justify-content-center w-100">
            <div className="col-lg-8 text-center">
              <AnimSection>
                <span className="hero-badge mb-4">
                  <FaRocket className="me-2" />
                  Our Services
                </span>
                <h1 className="hero-title mb-4">
                  Everything You <span className="text-gradient">Need</span>
                </h1>
                <p className="hero-subtitle mb-0">
                  Everything you need to connect students with trusted part-time job opportunities.
                </p>
              </AnimSection>
            </div>
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR ROLE */}
      <section className="py-5">
        <div className="container">
          <AnimSection>
            <div className="text-center mb-5">
              <span className="section-badge">Get Started</span>
              <h2 className="section-title">Choose Your <span className="text-gradient">Role</span></h2>
              <p className="section-subtitle">Select your role to explore the features available for you.</p>
            </div>
          </AnimSection>
          <div className="row g-4 justify-content-center">
            <div className="col-lg-5 col-md-6">
              <AnimSection animation="fade-left">
                <div
                  className="p-5 text-center rounded-4 h-100"
                  style={{ border: '2px solid #e2e8f0', cursor: 'pointer', transition: '0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 80, height: 80, background: '#7c3aed15' }}>
                    <FaUserGraduate size={36} style={{ color: '#7c3aed' }} />
                  </div>
                  <h4 className="fw-bold mb-2">Student Services</h4>
                  <p className="text-muted mb-4">Search, apply, and track jobs. Build your career while studying.</p>
                  <button className="btn btn-primary-gradient px-4 py-2 rounded-pill fw-semibold" onClick={() => navigate('/services/student')}>
                    Explore Student Features <FaArrowRight className="ms-2" />
                  </button>
                </div>
              </AnimSection>
            </div>
            <div className="col-lg-5 col-md-6">
              <AnimSection animation="fade-right">
                <div
                  className="p-5 text-center rounded-4 h-100"
                  style={{ border: '2px solid #e2e8f0', cursor: 'pointer', transition: '0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(37,99,235,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 80, height: 80, background: '#2563eb15' }}>
                    <FaBriefcase size={36} style={{ color: '#2563eb' }} />
                  </div>
                  <h4 className="fw-bold mb-2">Employer Services</h4>
                  <p className="text-muted mb-4">Post jobs, review candidates, and hire talented students.</p>
                  <button className="btn px-4 py-2 rounded-pill fw-semibold" style={{ background: '#2563eb', color: '#fff' }} onClick={() => navigate('/services/employer')}>
                    Explore Employer Features <FaArrowRight className="ms-2" />
                  </button>
                </div>
              </AnimSection>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
