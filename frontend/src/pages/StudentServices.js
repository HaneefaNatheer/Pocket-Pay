import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserGraduate, FaArrowRight, FaRocket, FaUserPlus, FaUserCheck,
  FaSearch, FaFilter, FaEye, FaBookmark, FaPaperPlane, FaChartLine,
  FaBell, FaMapMarkerAlt, FaLock, FaEnvelope, FaMobileAlt, FaSearchPlus,
  FaShieldAlt, FaHeadset, FaCheckCircle, FaBriefcase, FaStar, FaBuilding,
  FaClock, FaMoneyBillWave, FaHeart, FaExternalLinkAlt, FaTimes,
  FaUsers, FaRedo, FaCalendarAlt,
} from 'react-icons/fa';
import api from '../services/api';

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
              : 'translateY(40px)',
        transition: `all 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}




const demoNotifications = [
  { text: 'Your application for Web Developer at TechNova was accepted!', time: '2 min ago', type: 'accepted' },
  { text: 'Interview scheduled for Barista at Cafe Bloom on Aug 16', time: '1 hour ago', type: 'interview' },
  { text: 'New job matching your skills: UI Designer at PixelStudio', time: '3 hours ago', type: 'new' },
];

const demoApplications = [
  { title: 'Web Developer', company: 'TechNova Ltd', status: 'Accepted', color: '#10b981', date: 'Aug 1, 2026' },
  { title: 'Barista', company: 'Cafe Bloom', status: 'Interview', color: '#f59e0b', date: 'Aug 3, 2026' },
  { title: 'Delivery Rider', company: 'QuickDeliver', status: 'Pending', color: '#6b7280', date: 'Aug 5, 2026' },
  { title: 'Private Tutor', company: 'EduBright', status: 'Reviewed', color: '#3b82f6', date: 'Aug 6, 2026' },
  { title: 'Cashier', company: 'SuperMart', status: 'Rejected', color: '#ef4444', date: 'Aug 7, 2026' },
];

const filterCategories = ['All', 'food-service', 'tech', 'delivery', 'tutoring', 'retail', 'creative', 'part-time', 'freelance'];

export default function StudentServices() {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [showJobDetail, setShowJobDetail] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs?limit=50');
      const data = (res.data.data || []).map(job => ({
        id: job.id,
        title: job.title,
        company: job.employer?.company_name || 'Company',
        location: job.location || 'Not specified',
        salary: job.salary_min ? `LKR ${Number(job.salary_min).toLocaleString()}${job.salary_type === 'hourly' ? '/hr' : job.salary_type === 'daily' ? '/day' : job.salary_type === 'fixed' ? '/project' : '/mo'}` : 'Negotiable',
        salaryType: job.salary_type,
        type: job.job_type === 'remote' ? 'Remote' : job.job_type === 'hybrid' ? 'Hybrid' : 'On-Site',
        category: job.category,
        rating: 4.5,
        deadline: job.deadline ? job.deadline.split('T')[0] : 'Open',
        tags: Array.isArray(job.required_skills) ? job.required_skills : (job.required_skills ? JSON.parse(job.required_skills) : []),
        shiftDuration: job.shift_duration || null,
        workersNeeded: job.workers_needed || 1,
        workersHired: job.workers_hired || 0,
        isRecurring: job.is_recurring || false,
        workType: job.work_type || 'one-time',
        days: Array.isArray(job.available_days) ? job.available_days : (job.available_days ? JSON.parse(job.available_days) : []),
        hours: job.available_hours_start && job.available_hours_end
          ? `${job.available_hours_start} - ${job.available_hours_end}`
          : 'Flexible',
        benefits: job.benefits || '',
        description: job.description,
        requirements: job.requirements || '',
        views: job.views_count || 0,
        status: job.status,
      }));
      setJobs(data);
    } catch (err) {
      setJobs([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchJobs(); }, []);

  const filteredJobs = activeFilter === 'All' ? jobs : jobs.filter(j => j.category === activeFilter);

  const toggleSave = (id) => {
    setSavedJobs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleApply = (id) => {
    setAppliedJobs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="home-page">

      {/* HERO */}
      <section className="hero-section" style={{ minHeight: '45vh' }}>
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
        <div className="container position-relative d-flex align-items-center" style={{ minHeight: '45vh' }}>
          <div className="row justify-content-center w-100">
            <div className="col-lg-8 text-center">
              <AnimSection>
                <span className="hero-badge mb-4">
                  <FaUserGraduate className="me-2" />
                  Student Services
                </span>
                <h1 className="hero-title mb-3">
                  Find Your Perfect <span className="text-gradient">Part-Time Job</span>
                </h1>
                <p className="hero-subtitle mb-0">
                  Everything a student needs to discover, apply, and land the ideal part-time opportunity.
                </p>
              </AnimSection>
            </div>
          </div>
        </div>
      </section>

      {/* ============ JOB SEARCH & FILTER DEMO ============ */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #f8f7ff 0%, #ffffff 100%)' }}>
        <div className="container">
          <AnimSection>
            <div className="text-center mb-4">
              <span className="section-badge" style={{ background: '#7c3aed15', color: '#7c3aed' }}>
                <FaSearch className="me-2" />Feature Preview
              </span>
              <h2 className="section-title">Search & <span className="text-gradient">Filter Jobs</span></h2>
              <p className="section-subtitle">Browse available jobs and filter by category, salary, and more.</p>
            </div>
          </AnimSection>

          {/* Search Bar */}
          <AnimSection delay={0.1}>
            <div className="p-3 rounded-4 shadow-sm mb-4" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
              <div className="row g-2 align-items-center">
                <div className="col-md-5">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-0"><FaSearch className="text-muted" /></span>
                    <input type="text" className="form-control border-0" placeholder="Search by title, skill, or company..." readOnly style={{ cursor: 'default' }} />
                  </div>
                </div>
                <div className="col-md-3">
                  <select className="form-select" style={{ cursor: 'default' }}>
                    <option>All Categories</option>
                    {filterCategories.slice(1).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <select className="form-select" style={{ cursor: 'default' }}>
                    <option>Any Salary</option>
                    <option>LKR 20,000+</option>
                    <option>LKR 30,000+</option>
                    <option>LKR 40,000+</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn btn-primary-gradient w-100 rounded-pill fw-semibold">
                    <FaSearch className="me-1" /> Search
                  </button>
                </div>
              </div>
            </div>
          </AnimSection>

          {/* Category Filter Chips */}
          <AnimSection delay={0.15}>
            <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center">
              {filterCategories.map(cat => (
                <button
                  key={cat}
                  className="btn btn-sm rounded-pill px-3 py-1 fw-semibold"
                  style={{
                    background: activeFilter === cat ? '#7c3aed' : '#f1f5f9',
                    color: activeFilter === cat ? '#fff' : '#475569',
                    border: activeFilter === cat ? 'none' : '1px solid #e2e8f0',
                    transition: '0.2s',
                  }}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </AnimSection>

          {/* Job Cards */}
          <div className="row g-3">
            {loading ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border" style={{ color: '#7c3aed' }}><span className="visually-hidden">Loading...</span></div>
                <p className="text-muted mt-2">Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="col-12 text-center py-5">
                <FaBriefcase size={40} className="text-muted mb-3" />
                <h6 className="fw-bold text-muted">No jobs found</h6>
                <p className="text-muted" style={{ fontSize: '0.88rem' }}>
                  {activeFilter !== 'All' ? 'Try a different category filter.' : 'No jobs have been posted yet. Check back later!'}
                </p>
              </div>
            ) : filteredJobs.map((job, i) => (
              <div key={job.id} className="col-lg-4 col-md-6">
                <AnimSection delay={i * 0.08}>
                  <div className="rounded-4 p-4 h-100 d-flex flex-column" style={{ background: '#fff', border: '1px solid #e2e8f0', transition: '0.3s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge rounded-pill px-2 py-1" style={{ background: '#7c3aed15', color: '#7c3aed', fontSize: '0.7rem' }}>{job.category}</span>
                      <button className="btn btn-sm p-0 border-0 bg-transparent" onClick={() => toggleSave(job.id)}>
                        <FaBookmark size={16} style={{ color: savedJobs.includes(job.id) ? '#f59e0b' : '#cbd5e1' }} />
                      </button>
                    </div>
                    <h6 className="fw-bold mb-1">{job.title}</h6>
                    <div className="d-flex align-items-center gap-1 mb-2">
                      <FaBuilding size={12} className="text-muted" />
                      <small className="text-muted">{job.company}</small>
                    </div>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <span className="d-flex align-items-center gap-1"><FaMapMarkerAlt size={12} className="text-muted" /><small className="text-muted">{job.location}</small></span>
                      <span className="d-flex align-items-center gap-1"><FaClock size={12} className="text-muted" /><small className="text-muted">{job.hours}</small></span>
                    </div>
                    <div className="d-flex align-items-center gap-1 mb-2">
                      <FaMoneyBillWave size={13} style={{ color: '#10b981' }} />
                      <span className="fw-semibold" style={{ color: '#10b981', fontSize: '0.9rem' }}>{job.salary}</span>
                    </div>

                    {/* Shift & Work Details */}
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {job.isRecurring && (
                        <span className="d-flex align-items-center gap-1 badge rounded-pill px-2 py-1" style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.68rem' }}>
                          <FaRedo size={9} /> Daily
                        </span>
                      )}
                      {job.shiftDuration && (
                        <span className="d-flex align-items-center gap-1 badge rounded-pill px-2 py-1" style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.68rem' }}>
                          <FaClock size={9} /> {job.shiftDuration >= 60 ? `${Math.floor(job.shiftDuration/60)}h ${job.shiftDuration%60 ? job.shiftDuration%60 + 'm' : ''}`.trim() : `${job.shiftDuration}m`}
                        </span>
                      )}
                      {job.days.length > 0 && (
                        <span className="d-flex align-items-center gap-1 badge rounded-pill px-2 py-1" style={{ background: '#fefce8', color: '#ca8a04', fontSize: '0.68rem' }}>
                          <FaCalendarAlt size={9} /> {job.days.length} days/wk
                        </span>
                      )}
                    </div>

                    {/* Workers Needed */}
                    <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded-3" style={{ background: '#f8fafc', border: '1px dashed #e2e8f0' }}>
                      <FaUsers size={14} style={{ color: '#7c3aed' }} />
                      <small className="fw-semibold" style={{ fontSize: '0.78rem' }}>
                        {job.workersHired}/{job.workersNeeded} workers hired
                      </small>
                      <div className="ms-auto" style={{ width: 50, height: 5, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${(job.workersHired / job.workersNeeded) * 100}%`, height: '100%', background: job.workersHired >= job.workersNeeded ? '#10b981' : '#7c3aed', borderRadius: 10 }} />
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {job.tags.map((tag, ti) => (
                        <span key={ti} className="badge rounded-pill" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.68rem' }}>{tag}</span>
                      ))}
                    </div>
                    <div className="mt-auto d-flex gap-2">
                      <button className="btn btn-sm flex-grow-1 rounded-pill fw-semibold" style={{ background: '#7c3aed', color: '#fff' }} onClick={() => toggleApply(job.id)}>
                        {appliedJobs.includes(job.id) ? <><FaCheckCircle className="me-1" />Applied</> : <><FaPaperPlane className="me-1" />Apply</>}
                      </button>
                      <button className="btn btn-sm rounded-pill fw-semibold" style={{ border: '1.5px solid #e2e8f0', color: '#475569' }} onClick={() => setShowJobDetail(job)}>
                        <FaEye />
                      </button>
                    </div>
                  </div>
                </AnimSection>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOB DETAIL MODAL */}
      {showJobDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setShowJobDetail(null)}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="p-4" style={{ background: 'linear-gradient(135deg, #2e1065, #7c3aed)', borderRadius: '16px 16px 0 0' }}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <span className="badge rounded-pill px-2 py-1 mb-2" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.75rem' }}>{showJobDetail.category}</span>
                  <h5 className="text-white fw-bold mb-1">{showJobDetail.title}</h5>
                  <div className="d-flex align-items-center gap-2">
                    <FaBuilding size={13} className="text-white-50" />
                    <span className="text-white-50">{showJobDetail.company}</span>
                  </div>
                </div>
                <button className="btn btn-sm p-0 border-0 bg-transparent" onClick={() => setShowJobDetail(null)}>
                  <FaTimes size={18} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="row g-3 mb-3">
                <div className="col-6"><small className="text-muted d-block">Location</small><span className="fw-semibold"><FaMapMarkerAlt className="me-1 text-muted" />{showJobDetail.location}</span></div>
                <div className="col-6"><small className="text-muted d-block">Salary</small><span className="fw-semibold" style={{ color: '#10b981' }}><FaMoneyBillWave className="me-1" />{showJobDetail.salary}</span></div>
                <div className="col-6"><small className="text-muted d-block">Work Hours</small><span className="fw-semibold"><FaClock className="me-1 text-muted" />{showJobDetail.hours}</span></div>
                <div className="col-6"><small className="text-muted d-block">Rating</small><span className="fw-semibold"><FaStar className="me-1 text-warning" />{showJobDetail.rating}</span></div>
                <div className="col-6"><small className="text-muted d-block">Work Type</small><span className="fw-semibold"><FaRedo className="me-1 text-muted" />{showJobDetail.workType === 'daily' ? 'Daily Recurring' : showJobDetail.workType === 'weekly' ? 'Weekly Recurring' : showJobDetail.workType === 'flexible' ? 'Flexible Hours' : showJobDetail.workType === 'as-needed' ? 'As Needed' : 'One-Time'}</span></div>
                <div className="col-6"><small className="text-muted d-block">Deadline</small><span className="fw-semibold">{showJobDetail.deadline}</span></div>
              </div>

              {/* Shift Details */}
              {showJobDetail.shiftDuration && (
                <div className="p-3 rounded-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h6 className="fw-bold mb-2" style={{ fontSize: '0.88rem' }}><FaClock className="me-1" style={{ color: '#2563eb' }} />Shift Details</h6>
                  <div className="row g-2">
                    <div className="col-6"><small className="text-muted">Duration</small><div className="fw-semibold">{showJobDetail.shiftDuration >= 60 ? `${Math.floor(showJobDetail.shiftDuration/60)}h ${showJobDetail.shiftDuration%60 ? showJobDetail.shiftDuration%60 + 'min' : ''}`.trim() : `${showJobDetail.shiftDuration}min`}</div></div>
                    <div className="col-6"><small className="text-muted">Workers Needed</small><div className="fw-semibold">{showJobDetail.workersNeeded}</div></div>
                    {showJobDetail.days.length > 0 && (
                      <div className="col-12"><small className="text-muted">Working Days</small><div className="fw-semibold">{showJobDetail.days.join(', ')}</div></div>
                    )}
                  </div>
                </div>
              )}

              {/* Worker Availability */}
              <div className="p-3 rounded-3 mb-3" style={{ background: showJobDetail.workersHired >= showJobDetail.workersNeeded ? '#f0fdf4' : '#fefce8', border: `1px solid ${showJobDetail.workersHired >= showJobDetail.workersNeeded ? '#bbf7d0' : '#fef08a'}` }}>
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <FaUsers size={16} style={{ color: showJobDetail.workersHired >= showJobDetail.workersNeeded ? '#16a34a' : '#7c3aed' }} />
                    <div>
                      <small className="fw-semibold" style={{ fontSize: '0.82rem' }}>{showJobDetail.workersHired} of {showJobDetail.workersNeeded} positions filled</small>
                    </div>
                  </div>
                  <span className="badge rounded-pill px-2 py-1" style={{ background: showJobDetail.workersHired >= showJobDetail.workersNeeded ? '#dcfce7' : '#ede9fe', color: showJobDetail.workersHired >= showJobDetail.workersNeeded ? '#16a34a' : '#7c3aed', fontSize: '0.7rem', fontWeight: 600 }}>
                    {showJobDetail.workersHired >= showJobDetail.workersNeeded ? 'Full' : `${showJobDetail.workersNeeded - showJobDetail.workersHired} spots open`}
                  </span>
                </div>
              </div>

              <h6 className="fw-bold mb-2">Required Skills</h6>
              <div className="d-flex flex-wrap gap-1 mb-4">
                {showJobDetail.tags.map((tag, i) => (
                  <span key={i} className="badge rounded-pill px-2 py-1" style={{ background: '#7c3aed15', color: '#7c3aed' }}>{tag}</span>
                ))}
              </div>
              <div className="d-flex gap-2">
                <button className="btn flex-grow-1 rounded-pill fw-semibold py-2" style={{ background: '#7c3aed', color: '#fff' }} onClick={() => { toggleApply(showJobDetail.id); setShowJobDetail(null); }}>
                  {appliedJobs.includes(showJobDetail.id) ? <><FaCheckCircle className="me-1" />Applied</> : <><FaPaperPlane className="me-1" />Apply Now</>}
                </button>
                <button className="btn rounded-pill fw-semibold py-2 px-3" style={{ border: '1.5px solid #e2e8f0' }} onClick={() => toggleSave(showJobDetail.id)}>
                  <FaBookmark style={{ color: savedJobs.includes(showJobDetail.id) ? '#f59e0b' : '#94a3b8' }} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ APPLICATION TRACKING DEMO ============ */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 align-items-start">
            {/* Applications */}
            <div className="col-lg-7">
              <AnimSection>
                <h5 className="fw-bold mb-3"><FaChartLine className="me-2" style={{ color: '#7c3aed' }} />Track Application Status</h5>
                <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>Monitor your applications in real-time — see where you stand at a glance.</p>
              </AnimSection>
              <div className="d-flex flex-column gap-2">
                {demoApplications.map((app, i) => (
                  <AnimSection key={i} delay={i * 0.1}>
                    <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                      <div>
                        <h6 className="fw-bold mb-0" style={{ fontSize: '0.95rem' }}>{app.title}</h6>
                        <small className="text-muted">{app.company} &middot; Applied {app.date}</small>
                      </div>
                      <span className="badge rounded-pill px-3 py-1" style={{ background: `${app.color}15`, color: app.color, fontSize: '0.78rem', fontWeight: 600 }}>{app.status}</span>
                    </div>
                  </AnimSection>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="col-lg-5">
              <AnimSection delay={0.2}>
                <div className="position-relative">
                  <h5 className="fw-bold mb-3"><FaBell className="me-2" style={{ color: '#f59e0b' }} />Notifications</h5>
                  <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>Get instant alerts for job updates, applications, and messages.</p>
                  <div className="d-flex flex-column gap-2">
                    {demoNotifications.map((n, i) => (
                      <div key={i} className="p-3 rounded-3" style={{ background: '#fff', borderLeft: `3px solid ${n.type === 'accepted' ? '#10b981' : n.type === 'interview' ? '#f59e0b' : '#3b82f6'}` }}>
                        <p className="mb-1" style={{ fontSize: '0.88rem' }}>{n.text}</p>
                        <small className="text-muted">{n.time}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimSection>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section py-5">
        <div className="container">
          <AnimSection>
            <div className="cta-card p-5 text-center">
              <h2 className="cta-title mb-3">Ready to Start Your Career Journey?</h2>
              <p className="cta-subtitle mb-4">Join thousands of students already on Pocket-Pay.</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <button className="btn btn-primary-gradient btn-lg px-5" onClick={() => navigate('/register/student')}>
                  <FaUserGraduate className="me-2" />Register as Student
                </button>
                <button className="btn btn-outline-light btn-lg px-5" onClick={() => navigate('/services/employer')}>
                  <FaBriefcase className="me-2" />Explore Employer Features
                </button>
              </div>
            </div>
          </AnimSection>
        </div>
      </section>

    </div>
  );
}
