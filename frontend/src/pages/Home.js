import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import heroVideo from '../assets/images/pocket-pay-video.mp4';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FaRobot,
  FaMapMarkerAlt,
  FaStar,
  FaShieldAlt,
  FaSearch,
  FaStore,
  FaUtensils,
  FaBookReader,
  FaTruck,
  FaClipboardList,
  FaLaptop,
  FaChevronRight,
  FaQuoteLeft,
  FaUserGraduate,
  FaBriefcase,
  FaUsers,
  FaArrowRight,
  FaRocket,
  FaUserPlus,
  FaSearchPlus,
  FaHandshake,
  FaClock,
  FaBuilding,
  FaMoneyBillWave,
  FaEye,
} from 'react-icons/fa';

function AnimatedCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const duration = 2000;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref} className="counter-value">
      {count}{suffix}
    </span>
  );
}

const features = [
  {
    icon: FaRobot,
    title: 'Smart Job Matching',
    description: 'AI-powered algorithm matches your skills with the perfect daily wage, part-time, or freelance opportunity.',
    color: '#7c3aed',
  },
  {
    icon: FaMapMarkerAlt,
    title: 'Nearby Flexible Jobs',
    description: 'Find shop, delivery, event, and office jobs close to your home or campus. Work on your schedule.',
    color: '#ec4899',
  },
  {
    icon: FaStar,
    title: 'Instant Apply',
    description: 'Apply to retail, restaurant, tutoring, and warehouse jobs with one click — no complicated forms.',
    color: '#f59e0b',
  },
  {
    icon: FaShieldAlt,
    title: 'Verified Employers',
    description: 'Every employer is verified. Work with confidence at shops, hotels, restaurants, and more.',
    color: '#10b981',
  },
];

const steps = [
  {
    icon: FaUserPlus,
    number: '01',
    title: 'Create Profile',
    description: 'Register and add your skills, availability, and preferences.',
  },
  {
    icon: FaSearchPlus,
    number: '02',
    title: 'Search & Apply',
    description: 'Browse matching jobs, filter by category, and apply with one click.',
  },
  {
    icon: FaHandshake,
    number: '03',
    title: 'Get Hired',
    description: 'Interview with employers, negotiate terms, and start your career.',
  },
];

const categories = [
  { icon: FaBriefcase, name: 'Daily Wage / Flexible', slug: 'daily-wage', color: '#7c3aed' },
  { icon: FaStar, name: 'Promotion & Event', slug: 'promotion', color: '#ec4899' },
  { icon: FaBookReader, name: 'Education', slug: 'education', color: '#10b981' },
  { icon: FaClipboardList, name: 'Office Support', slug: 'office-support', color: '#f59e0b' },
  { icon: FaTruck, name: 'Delivery & Transport', slug: 'delivery-transport', color: '#3b82f6' },
  { icon: FaStore, name: 'Retail', slug: 'retail', color: '#8b5cf6' },
  { icon: FaUtensils, name: 'Hotel & Tourism', slug: 'hotel-tourism', color: '#f97316' },
  { icon: FaLaptop, name: 'Freelance / Skill', slug: 'freelance', color: '#06b6d4' },
];

const testimonials = [
  {
    name: 'Kavindi Perera',
    university: 'University of Colombo',
    avatar: 'KP',
    rating: 5,
    text: 'Found a shop assistant job near my home through Pocket-Pay. The daily wage system fits perfectly around my class schedule. No more asking parents for money!',
  },
  {
    name: 'Rashmika Fernando',
    university: 'University of Moratuwa',
    avatar: 'RF',
    rating: 5,
    text: 'I was looking for weekend waiter work to support myself. Within days I got hired at a restaurant. Flexible hours, good pay, and the employer was fully verified.',
  },
  {
    name: 'Thanuja Seneviratne',
    university: 'University of Peradeniya',
    avatar: 'TS',
    rating: 5,
    text: 'Started as a home tutor through Pocket-Pay. Now I have 3 regular students and earn enough to cover my expenses. Perfect for students who want to earn while learning.',
  },
];

const stats = [
  { icon: FaBriefcase, value: 500, suffix: '+', label: 'Daily Wage / Part-Time Jobs' },
  { icon: FaUsers, value: 200, suffix: '+', label: 'Trusted Employers' },
  { icon: FaUserGraduate, value: 1000, suffix: '+', label: 'Students Earning' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [promptType, setPromptType] = useState(null);
  const [recentLoading, setRecentLoading] = useState(true);

  const fetchRecentJobs = useCallback(async () => {
    try {
      const res = await api.get('/jobs?limit=6&sort=created_at&order=desc');
      const data = (res.data.data || []).map(job => ({
        id: job.id,
        title: job.title,
        company: job.employer?.company_name || 'Company',
        location: job.location || 'Not specified',
        salary: job.salary_min ? `LKR ${Number(job.salary_min).toLocaleString()}${job.salary_type === 'hourly' ? '/hr' : job.salary_type === 'daily' ? '/day' : job.salary_type === 'fixed' ? '/project' : '/mo'}` : 'Negotiable',
        category: job.category,
        tags: Array.isArray(job.required_skills) ? job.required_skills : (job.required_skills ? JSON.parse(job.required_skills) : []),
        workersNeeded: job.workers_needed || 1,
        workersHired: job.workers_hired || 0,
      }));
      setRecentJobs(data);
    } catch {
      setRecentJobs([]);
    }
    setRecentLoading(false);
  }, []);

  useEffect(() => { fetchRecentJobs(); }, [fetchRecentJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (slug) => {
    if (user?.role === 'student') {
      navigate(`/services/student?category=${slug}`);
    } else {
      setPromptType('student');
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <video className="hero-video-bg" autoPlay muted loop playsInline>
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="hero-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }} />
          ))}
        </div>
        <div className="container position-relative">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <span className="hero-badge mb-4">
                <FaRocket className="me-2" />
                Lanka&apos;s #1 Student Job Platform
              </span>
              <h1 className="hero-title mb-3">
                Find Daily Wage &
                <br />
                <span className="text-gradient">Part-Time Jobs</span>
              </h1>
              <p className="hero-subtitle mb-4">
                Shop assistant, delivery rider, cashier, waiter, data entry — connect with trusted employers near you.
              </p>
              <form onSubmit={handleSearch} className="hero-search mx-auto mb-4">
                <div className="input-group input-group-lg shadow-lg">
                  <span className="input-group-text bg-white border-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-0 py-3"
                    placeholder="Search jobs by title, skill, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary-gradient px-4 px-lg-5">
                    Search
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {stats.map((stat, index) => (
              <div key={index} className="col-md-4">
                <div className="stats-card text-center p-4 h-100">
                  <div className="stats-icon mb-3">
                    <stat.icon size={36} />
                  </div>
                  <div className="stats-value">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="stats-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-badge">Why Choose Us</span>
            <h2 className="section-title">
              Everything You Need to Find
              <br />
              <span className="text-gradient">The Right Job</span>
            </h2>
            <p className="section-subtitle">
              Daily wage jobs, part-time shifts, and freelance gigs — designed for students who want to earn while studying.
            </p>
          </div>
          <div className="row g-4">
            {features.map((feature, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className="feature-card h-100">
                  <div className="feature-icon mx-auto mb-3" style={{ backgroundColor: `${feature.color}12` }}>
                    <feature.icon size={28} style={{ color: feature.color }} />
                  </div>
                  <h5 className="feature-title mb-2">{feature.title}</h5>
                  <p className="feature-description text-muted mb-0">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-badge">Simple Process</span>
            <h2 className="section-title">
              How It <span className="text-gradient">Works</span>
            </h2>
            <p className="section-subtitle">
              Create your profile, find daily wage or part-time jobs near you, and start earning in 3 simple steps.
            </p>
          </div>
          <div className="row g-4 align-items-start">
            {steps.map((step, index) => (
              <div key={index} className="col-lg-4">
                <div className="step-card text-center">
                  <div className="step-number mb-3">{step.number}</div>
                  <div className="step-icon mx-auto mb-3">
                    <step.icon size={32} />
                  </div>
                  <h4 className="step-title mb-2">{step.title}</h4>
                  <p className="step-description text-muted">{step.description}</p>
                  {index < steps.length - 1 && (
                    <div className="step-connector d-none d-lg-block">
                      <FaChevronRight size={20} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-badge">Browse Categories</span>
            <h2 className="section-title">
              Explore Job <span className="text-gradient">Categories</span>
            </h2>
            <p className="section-subtitle">
              From shop assistant to delivery rider, tutor to event staff — explore jobs that fit your schedule.
            </p>
          </div>
          <div className="row g-3 justify-content-center">
            {categories.map((category, index) => (
              <div key={index} className="col-6 col-md-4 col-lg-3">
                <div
                  className="category-card p-4 text-center h-100"
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  <div className="category-icon mx-auto mb-3" style={{ color: category.color }}>
                    <category.icon size={32} />
                  </div>
                  <h6 className="category-name mb-0">{category.name}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-badge">Testimonials</span>
            <h2 className="section-title">
              What Students <span className="text-gradient">Say</span>
            </h2>
            <p className="section-subtitle">
              Real students earning real money — hear how Pocket-Pay helped them find daily wage and part-time jobs.
            </p>
          </div>
          <div className="row g-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="col-lg-4">
                <div className="testimonial-card h-100 p-4">
                  <FaQuoteLeft className="quote-icon mb-3" size={20} />
                  <p className="testimonial-text mb-4">{testimonial.text}</p>
                  <div className="testimonial-rating mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="text-warning" />
                    ))}
                  </div>
                  <div className="testimonial-author d-flex align-items-center">
                    <div className="author-avatar me-3">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h6 className="author-name mb-0">{testimonial.name}</h6>
                      <small style={{ color: 'rgba(255,255,255,0.5)' }}>{testimonial.university}</small>
                    </div>
                  </div>
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
            <h2 className="cta-title mb-3">Ready to Start?</h2>
            <p className="cta-subtitle mb-4">
              Join thousands of students and employers already on Pocket-Pay.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <button
                className="btn btn-white btn-lg px-5"
                onClick={() => { if (user) { navigate('/services/student'); } else { setPromptType('student'); } }}
              >
                <FaUserGraduate className="me-2" />
                {user ? 'Student Services' : 'Register as Student'}
              </button>
              <button
                className="btn btn-outline-light btn-lg px-5"
                onClick={() => { if (user) { navigate('/services/employer'); } else { setPromptType('employer'); } }}
              >
                <FaBriefcase className="me-2" />
                {user ? 'Employer Services' : 'Register as Employer'}
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Login Prompt Modal */}
      {promptType && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}
          onClick={() => setPromptType(null)}>
          <div style={{ background: '#fff', borderRadius: 20, maxWidth: 420, width: '100%', padding: 32, textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', background: promptType === 'employer' ? '#eff6ff' : '#fef2f2' }}>
              <FaBriefcase size={28} style={{ color: promptType === 'employer' ? '#2563eb' : '#ef4444' }} />
            </div>
            <h5 className="fw-bold mb-2">Login Required</h5>
            <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
              {promptType === 'employer'
                ? 'Please log in as an employer to post jobs and hire students. Don&apos;t have an account? Register for free!'
                : 'Please log in as a student to browse and apply for jobs. Don&apos;t have an account? Register for free!'}
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <button className="btn rounded-pill px-4 fw-semibold py-2" style={{ background: promptType === 'employer' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none' }}
                onClick={() => { setPromptType(null); navigate('/login'); }}>
                Login
              </button>
              <button className="btn rounded-pill px-4 fw-semibold py-2" style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}
                onClick={() => { setPromptType(null); navigate(promptType === 'employer' ? '/register/employer' : '/register/student'); }}>
                Register
              </button>
              <button className="btn rounded-pill px-3 fw-semibold py-2" style={{ background: 'transparent', color: '#94a3b8', border: 'none' }}
                onClick={() => setPromptType(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
