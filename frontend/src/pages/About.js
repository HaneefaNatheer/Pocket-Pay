import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBullseye,
  FaEye,
  FaUsers,
  FaLightbulb,
  FaHeart,
  FaGlobe,
  FaRocket,
  FaHandshake,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLinkedin,
  FaTwitter,
  FaGithub,
  FaInstagram,
  FaArrowRight,
  FaCheckCircle,
  FaUserGraduate,
  FaBriefcase,
  FaBuilding,
  FaStar,
} from 'react-icons/fa';
import PocketPayLogo from '../components/common/PocketPayLogo';

const teamMembers = [
  {
    name: 'Alex Johnson',
    role: 'CEO & Co-Founder',
    bio: 'Former career counselor with 10+ years helping students find employment.',
    initials: 'AJ',
    color: '#7c3aed',
  },
  {
    name: 'Maria Garcia',
    role: 'CTO & Co-Founder',
    bio: 'Full-stack developer passionate about using technology to solve real-world problems.',
    initials: 'MG',
    color: '#ec4899',
  },
  {
    name: 'David Kim',
    role: 'Head of Operations',
    bio: 'Operations expert dedicated to connecting the right students with the right employers.',
    initials: 'DK',
    color: '#10b981',
  },
  {
    name: 'Rachel Chen',
    role: 'Head of Marketing',
    bio: 'Marketing strategist focused on reaching students where they are.',
    initials: 'RC',
    color: '#f59e0b',
  },
];

const values = [
  {
    icon: FaHeart,
    title: 'Integrity',
    description: 'We operate with transparency and honesty in everything we do. Your trust is our foundation.',
    color: '#ec4899',
  },
  {
    icon: FaLightbulb,
    title: 'Innovation',
    description: 'We constantly evolve our platform using cutting-edge technology to serve you better.',
    color: '#f59e0b',
  },
  {
    icon: FaGlobe,
    title: 'Inclusion',
    description: 'We believe every student deserves equal access to quality part-time job opportunities.',
    color: '#7c3aed',
  },
  {
    icon: FaRocket,
    title: 'Impact',
    description: 'We measure success by the positive difference we make in students\' lives and careers.',
    color: '#10b981',
  },
];

const stats = [
  { icon: FaUserGraduate, value: '1,000+', label: 'Students Registered' },
  { icon: FaBuilding, value: '200+', label: 'Verified Employers' },
  { icon: FaBriefcase, value: '500+', label: 'Jobs Posted' },
  { icon: FaStar, value: '4.8/5', label: 'Average Rating' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      {/* Hero Banner */}
      <section className="about-hero-section">
        <div className="container position-relative">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <span className="hero-badge mb-4">
                <FaRocket className="me-2" />
                Our Story
              </span>
              <h1 className="hero-title mb-4 fade-in">
                About <span className="text-gradient">Pocket-Pay</span>
              </h1>
              <p className="hero-subtitle mb-0 slide-up">
                Empowering students to find meaningful work opportunities that align with their
                skills, schedules, and career aspirations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="mission-card p-4 h-100 fade-in">
                <div className="mission-icon mb-4">
                  <FaBullseye size={40} />
                </div>
                <h3 className="mb-3">Our Mission</h3>
                <p className="text-muted mb-0">
                  To bridge the gap between students seeking meaningful part-time work and
                  employers looking for talented, motivated individuals. We strive to make
                  the job search process seamless, safe, and successful for every student.
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="vision-card p-4 h-100 fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="vision-icon mb-4">
                  <FaEye size={40} />
                </div>
                <h3 className="mb-3">Our Vision</h3>
                <p className="text-muted mb-0">
                  To become the most trusted and comprehensive platform connecting students
                  with part-time employment opportunities worldwide, creating a community
                  where every student can gain real-world experience while studying.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="our-story-section py-5">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="section-badge">How It Started</span>
              <h2 className="section-title">Our <span className="text-gradient">Story</span></h2>
              <p className="text-muted">
                Pocket-Pay was born from a simple observation: students struggle to find
                part-time jobs that fit their unique schedules and skill sets, while employers
                struggle to find reliable student workers.
              </p>
              <p className="text-muted">
                Founded in 2024 by a group of former students who experienced these challenges
                firsthand, we set out to create a platform that would make the process effortless.
                What started as a small project at a university hackathon has grown into a
                thriving community of students and employers.
              </p>
              <p className="text-muted mb-0">
                Today, we proudly connect thousands of students with hundreds of verified
                employers, helping students build their careers while they study.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="story-visual">
                <div className="story-card-1 p-4 fade-in">
                  <FaUsers size={48} className="mb-3 text-primary" />
                  <h5>Community First</h5>
                  <p className="text-muted mb-0">Building connections that matter beyond just jobs.</p>
                </div>
                <div className="story-card-2 p-4 fade-in" style={{ animationDelay: '0.2s' }}>
                  <FaHandshake size={48} className="mb-3 text-success" />
                  <h5>Trusted Partnerships</h5>
                  <p className="text-muted mb-0">Every employer is verified for your safety.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-badge">Our People</span>
            <h2 className="section-title">Meet the <span className="text-gradient">Team</span></h2>
            <p className="section-subtitle">The passionate people behind Pocket-Pay.</p>
          </div>
          <div className="row g-4 justify-content-center">
            {teamMembers.map((member, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="team-card text-center p-4 h-100 slide-up" style={{ animationDelay: `${index * 0.15}s` }}>
                  <div className="team-avatar mx-auto mb-4" style={{ backgroundColor: `${member.color}20` }}>
                    <span style={{ color: member.color }}>{member.initials}</span>
                  </div>
                  <h5 className="team-name mb-1">{member.name}</h5>
                  <span className="team-role mb-3 d-block" style={{ color: member.color }}>
                    {member.role}
                  </span>
                  <p className="team-bio text-muted mb-3">{member.bio}</p>
                  <div className="team-social">
                    <a href="#" className="social-link"><FaLinkedin /></a>
                    <a href="#" className="social-link"><FaTwitter /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-badge">What Drives Us</span>
            <h2 className="section-title">Our <span className="text-gradient">Values</span></h2>
            <p className="section-subtitle">The core principles that guide everything we do.</p>
          </div>
          <div className="row g-4">
            {values.map((value, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="value-card text-center p-4 h-100 fade-in" style={{ animationDelay: `${index * 0.15}s` }}>
                  <div className="value-icon mx-auto mb-4" style={{ color: value.color }}>
                    <value.icon size={40} />
                  </div>
                  <h5 className="value-title mb-3">{value.title}</h5>
                  <p className="value-description text-muted mb-0">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="about-stats-section py-5">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {stats.map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="about-stat-card text-center p-4 fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <stat.icon size={36} className="mb-3 text-primary" />
                  <div className="stat-value-display">{stat.value}</div>
                  <div className="stat-label-display">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5">
        <div className="container">
          <div className="cta-card p-5 text-center">
            <h2 className="cta-title mb-3">Join Our Community</h2>
            <p className="cta-subtitle mb-4">
              Be a part of the movement that is transforming how students find work.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button
                className="btn btn-primary-gradient btn-lg px-5"
                onClick={() => navigate('/register/student')}
              >
                <FaUserGraduate className="me-2" />
                Register as Student
              </button>
              <button
                className="btn btn-outline-light btn-lg px-5"
                onClick={() => navigate('/register/employer')}
              >
                <FaBriefcase className="me-2" />
                Register as Employer
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <h5 className="footer-brand mb-3">
                <PocketPayLogo size={28} className="me-2" />
                Pocket-Pay
              </h5>
              <p className="text-muted">
                Connecting students with meaningful part-time job opportunities since 2024.
              </p>
            </div>
            <div className="col-lg-2 col-md-4">
              <h6 className="footer-heading mb-3">Quick Links</h6>
              <ul className="footer-links list-unstyled">
                <li><a href="/jobs">Find Jobs</a></li>
                <li><a href="/about">About Us</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/faq">FAQ</a></li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-4">
              <h6 className="footer-heading mb-3">For Students</h6>
              <ul className="footer-links list-unstyled">
                <li><a href="/register">Sign Up</a></li>
                <li><a href="/login">Login</a></li>
                <li><a href="/jobs">Browse Jobs</a></li>
                <li><a href="/profile">My Profile</a></li>
              </ul>
            </div>
            <div className="col-lg-2 col-md-4">
              <h6 className="footer-heading mb-3">For Employers</h6>
              <ul className="footer-links list-unstyled">
                <li><a href="/register/employer">Post a Job</a></li>
                <li><a href="/employer/dashboard">Dashboard</a></li>
                <li><a href="/employer/candidates">Candidates</a></li>
                <li><a href="/pricing">Pricing</a></li>
              </ul>
            </div>
            <div className="col-lg-2">
              <h6 className="footer-heading mb-3">Legal</h6>
              <ul className="footer-links list-unstyled">
                <li><a href="/privacy">Privacy Policy</a></li>
                <li><a href="/terms">Terms of Service</a></li>
                <li><a href="/cookies">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <hr className="my-4" />
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <p className="text-muted mb-0 small">
                &copy; {new Date().getFullYear()} Pocket-Pay. All rights reserved.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <p className="text-muted mb-0 small">
                Made with <span className="text-danger">&hearts;</span> for students everywhere
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
