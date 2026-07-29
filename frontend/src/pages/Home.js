import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaRobot,
  FaMapMarkerAlt,
  FaStar,
  FaShieldAlt,
  FaSearch,
  FaLaptopCode,
  FaStore,
  FaUtensils,
  FaBookReader,
  FaTruck,
  FaPaintBrush,
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
    description: 'AI-powered algorithm matches your skills and preferences with the perfect job opportunities.',
    color: '#7c3aed',
  },
  {
    icon: FaMapMarkerAlt,
    title: 'Nearby Jobs',
    description: 'Find job opportunities close to your campus or home. Save time and maximize your schedule.',
    color: '#ec4899',
  },
  {
    icon: FaStar,
    title: 'Skill Matching',
    description: 'Highlight your unique skills and get matched with employers who need exactly what you offer.',
    color: '#f59e0b',
  },
  {
    icon: FaShieldAlt,
    title: 'Verified Employers',
    description: 'Every employer is verified and reviewed. Work with confidence and safety.',
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
  { icon: FaLaptopCode, name: 'Tech', slug: 'tech', color: '#7c3aed' },
  { icon: FaStore, name: 'Retail', slug: 'retail', color: '#ec4899' },
  { icon: FaUtensils, name: 'Food Service', slug: 'food-service', color: '#f59e0b' },
  { icon: FaBookReader, name: 'Tutoring', slug: 'tutoring', color: '#10b981' },
  { icon: FaTruck, name: 'Delivery', slug: 'delivery', color: '#3b82f6' },
  { icon: FaPaintBrush, name: 'Creative', slug: 'creative', color: '#8b5cf6' },
  { icon: FaClipboardList, name: 'Admin', slug: 'admin', color: '#f97316' },
  { icon: FaLaptop, name: 'Remote', slug: 'remote', color: '#06b6d4' },
];

const testimonials = [
  {
    name: 'Sarah Mitchell',
    university: 'University of California, Berkeley',
    avatar: 'SM',
    rating: 5,
    text: 'Pocket-Pay helped me find a part-time web development role that perfectly fits my schedule. The skill matching feature is incredible!',
  },
  {
    name: 'James Rodriguez',
    university: 'New York University',
    avatar: 'JR',
    rating: 5,
    text: 'I was struggling to find flexible work near campus. Within a week of signing up, I had three interview offers. Best platform for students!',
  },
  {
    name: 'Emily Chen',
    university: 'Stanford University',
    avatar: 'EC',
    rating: 5,
    text: 'The verified employers gave me peace of mind. I found a tutoring job that pays well and builds my resume. Highly recommended!',
  },
];

const stats = [
  { icon: FaBriefcase, value: 500, suffix: '+', label: 'Jobs Available' },
  { icon: FaUsers, value: 200, suffix: '+', label: 'Trusted Employers' },
  { icon: FaUserGraduate, value: 1000, suffix: '+', label: 'Students Connected' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (slug) => {
    navigate(`/jobs?category=${slug}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
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
                Trusted by 1000+ Students
              </span>
              <h1 className="hero-title mb-3">
                Find Your Perfect
                <br />
                <span className="text-gradient">Part-Time Job</span>
              </h1>
              <p className="hero-subtitle mb-4">
                Connect with trusted employers. Build your career while studying.
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
              <div className="hero-tags d-flex gap-2 justify-content-center flex-wrap">
                {['Web Development', 'Tutoring', 'Data Entry', 'Design'].map((tag) => (
                  <span
                    key={tag}
                    className="badge bg-white bg-opacity-10 border border-white border-opacity-20"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/jobs?search=${encodeURIComponent(tag)}`)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
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
                <div className="stats-card text-center p-4">
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
              Powerful features designed specifically for students looking for part-time opportunities.
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
              Get started in three easy steps and land your dream part-time job.
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
              Find opportunities in the field that matches your skills and interests.
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
              Hear from students who found their perfect part-time jobs.
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
    </div>
  );
}
