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




const statusConfig = {
  pending: { label: 'Pending', color: '#6b7280', bg: '#f3f4f6' },
  reviewed: { label: 'Reviewed', color: '#3b82f6', bg: '#eff6ff' },
  shortlisted: { label: 'Shortlisted', color: '#8b5cf6', bg: '#f5f3ff' },
  interview: { label: 'Interview', color: '#f59e0b', bg: '#fffbeb' },
  accepted: { label: 'Accepted', color: '#10b981', bg: '#ecfdf5' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: '#fef2f2' },
};

const filterCategories = ['All', 'food-service', 'tech', 'delivery', 'tutoring', 'retail', 'creative', 'part-time', 'freelance'];

export default function StudentServices() {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showJobDetail, setShowJobDetail] = useState(null);
  const [showNotif, setShowNotif] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
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

  useEffect(() => { fetchJobs(); fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications', { params: { limit: 20 } });
      setApplications(res.data?.data || []);
    } catch {
      setApplications([]);
    } finally {
      setAppsLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hour ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredJobs = jobs.filter(j => {
    const matchCategory = activeFilter === 'All' || j.category === activeFilter;
    const query = searchQuery.toLowerCase();
    const matchSearch = !query || j.title.toLowerCase().includes(query) || j.company.toLowerCase().includes(query) || j.tags.some(t => t.toLowerCase().includes(query));
    return matchCategory && matchSearch;
  });

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

      {/* ============ JOB SEARCH & FILTER ============ */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #f8f7ff 0%, #ffffff 100%)' }}>
        <div className="container">
          <AnimSection>
            <div className="text-center mb-4">
              <span className="section-badge" style={{ background: '#7c3aed15', color: '#7c3aed' }}>
                <FaSearch className="me-2" />Available Jobs
              </span>
              <h2 className="section-title">Search & <span className="text-gradient">Filter Jobs</span></h2>
              <p className="section-subtitle">Browse available part-time jobs and find the perfect fit for your schedule.</p>
            </div>
          </AnimSection>

          {/* Search Bar - Glass effect */}
          <AnimSection delay={0.1}>
            <div className="p-3 rounded-4 mb-4" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(124,58,237,0.12)', boxShadow: '0 4px 24px rgba(124,58,237,0.06)' }}>
              <div className="row g-2 align-items-center">
                <div className="col-md-5">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-0"><FaSearch style={{ color: '#7c3aed' }} /></span>
                    <input type="text" className="form-control border-0" placeholder="Search by title, skill, or company..." style={{ background: 'transparent', outline: 'none', boxShadow: 'none' }}
                      value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-3">
                  <select className="form-select border-0" style={{ background: '#f8f7ff', cursor: 'pointer' }}
                    value={activeFilter} onChange={e => setActiveFilter(e.target.value)}>
                    <option value="All">All Categories</option>
                    {filterCategories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-2">
                  <button className="btn w-100 rounded-pill fw-semibold" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none' }}
                    onClick={() => setSearchQuery('')}>
                    <FaSearch className="me-1" /> {searchQuery ? 'Clear' : 'Browse'}
                  </button>
                </div>
              </div>
            </div>
          </AnimSection>

          {/* Category Filter Chips with animation */}
          <AnimSection delay={0.15}>
            <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center">
              {filterCategories.map(cat => (
                <button
                  key={cat}
                  className="btn btn-sm rounded-pill px-3 py-1 fw-semibold"
                  style={{
                    background: activeFilter === cat ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#f1f5f9',
                    color: activeFilter === cat ? '#fff' : '#475569',
                    border: activeFilter === cat ? 'none' : '1px solid #e2e8f0',
                    transform: activeFilter === cat ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: activeFilter === cat ? '0 4px 12px rgba(124,58,237,0.3)' : 'none',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = activeFilter === cat ? 'scale(1.05)' : 'scale(1)'; e.currentTarget.style.boxShadow = activeFilter === cat ? '0 4px 12px rgba(124,58,237,0.3)' : 'none'; }}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat === 'All' ? '🔥 All' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                </button>
              ))}
            </div>
          </AnimSection>

          {/* Results count */}
          <AnimSection delay={0.18}>
            <div className="d-flex justify-content-between align-items-center mb-3 px-1">
              <small className="text-muted fw-semibold">
                {searchQuery ? `"${searchQuery}" — ` : ''}{filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
              </small>
              <div className="d-flex align-items-center gap-2">
                <FaClock size={12} className="text-muted" />
                <small className="text-muted">Updated just now</small>
              </div>
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
                <div style={{ opacity: 0.5 }}>
                  <FaBriefcase size={48} className="text-muted mb-3" />
                </div>
                <h6 className="fw-bold" style={{ color: '#475569' }}>No jobs match your criteria</h6>
                <p className="text-muted mb-3" style={{ fontSize: '0.88rem', maxWidth: 400, margin: '0 auto' }}>
                  {searchQuery && activeFilter !== 'All'
                    ? `No "${activeFilter}" jobs matching "${searchQuery}". Try a different search or category.`
                    : searchQuery
                      ? `No jobs matching "${searchQuery}". Try different keywords.`
                      : activeFilter !== 'All'
                        ? `No jobs in "${activeFilter}" category yet. Try a different filter or check back later!`
                        : 'No jobs have been posted yet. Check back later!'}
                </p>
                {(searchQuery || activeFilter !== 'All') && (
                  <button className="btn btn-sm rounded-pill px-4 fw-semibold" style={{ background: '#7c3aed15', color: '#7c3aed', border: '1px solid #7c3aed30' }}
                    onClick={() => { setSearchQuery(''); setActiveFilter('All'); }}>
                    <FaTimes className="me-1" /> Clear All Filters
                  </button>
                )}
              </div>
            ) : filteredJobs.map((job, i) => (
              <div key={job.id} className="col-lg-4 col-md-6">
                <AnimSection delay={i * 0.08}>
                  <div className="rounded-4 p-4 h-100 d-flex flex-column position-relative overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0', transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.1)'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    {/* Top gradient line */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />

                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge rounded-pill px-2 py-1 d-flex align-items-center gap-1" style={{ background: '#7c3aed15', color: '#7c3aed', fontSize: '0.7rem', fontWeight: 600 }}>
                        <FaBriefcase size={9} />{job.category}
                      </span>
                      <button className="btn btn-sm p-0 border-0 bg-transparent" onClick={() => toggleSave(job.id)}
                        style={{ transition: '0.2s', transform: savedJobs.includes(job.id) ? 'scale(1.1)' : 'scale(1)' }}>
                        <FaBookmark size={16} style={{ color: savedJobs.includes(job.id) ? '#f59e0b' : '#cbd5e1' }} />
                      </button>
                    </div>
                    <h6 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>{job.title}</h6>
                    <div className="d-flex align-items-center gap-1 mb-2">
                      <FaBuilding size={12} style={{ color: '#7c3aed' }} />
                      <small className="fw-semibold" style={{ color: '#64748b' }}>{job.company}</small>
                    </div>

                    {/* Salary highlight */}
                    <div className="d-flex align-items-center gap-1 mb-2 p-2 rounded-3" style={{ background: '#f0fdf4' }}>
                      <FaMoneyBillWave size={13} style={{ color: '#10b981' }} />
                      <span className="fw-bold" style={{ color: '#059669', fontSize: '0.95rem' }}>{job.salary}</span>
                    </div>

                    <div className="d-flex align-items-center gap-3 mb-2">
                      <span className="d-flex align-items-center gap-1"><FaMapMarkerAlt size={11} className="text-muted" /><small className="text-muted">{job.location}</small></span>
                      <span className="d-flex align-items-center gap-1"><FaClock size={11} className="text-muted" /><small className="text-muted">{job.type}</small></span>
                    </div>

                    {/* Shift & Work Details */}
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {job.isRecurring && (
                        <span className="d-flex align-items-center gap-1 badge rounded-pill px-2 py-1" style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '0.68rem', fontWeight: 500 }}>
                          <FaRedo size={9} /> Daily
                        </span>
                      )}
                      {job.shiftDuration && (
                        <span className="d-flex align-items-center gap-1 badge rounded-pill px-2 py-1" style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.68rem', fontWeight: 500 }}>
                          <FaClock size={9} /> {job.shiftDuration >= 60 ? `${Math.floor(job.shiftDuration/60)}h ${job.shiftDuration%60 ? job.shiftDuration%60 + 'm' : ''}`.trim() : `${job.shiftDuration}m`}
                        </span>
                      )}
                      {job.days.length > 0 && (
                        <span className="d-flex align-items-center gap-1 badge rounded-pill px-2 py-1" style={{ background: '#fefce8', color: '#ca8a04', fontSize: '0.68rem', fontWeight: 500 }}>
                          <FaCalendarAlt size={9} /> {job.days.length} day{job.days.length > 1 ? 's' : ''}/wk
                        </span>
                      )}
                    </div>

                    {/* Workers Needed */}
                    <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded-3" style={{ background: '#f8fafc', border: '1px dashed #e2e8f0' }}>
                      <FaUsers size={14} style={{ color: '#7c3aed' }} />
                      <small className="fw-semibold" style={{ fontSize: '0.78rem', color: '#475569' }}>
                        {job.workersHired}/{job.workersNeeded} hired
                      </small>
                      <div className="ms-auto" style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min((job.workersHired / job.workersNeeded) * 100, 100)}%`, height: '100%', background: job.workersHired >= job.workersNeeded ? '#10b981' : 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 10, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>

                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {job.tags.slice(0, 3).map((tag, ti) => (
                        <span key={ti} className="badge rounded-pill" style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.68rem', fontWeight: 400 }}>{tag}</span>
                      ))}
                      {job.tags.length > 3 && (
                        <span className="badge rounded-pill" style={{ background: '#f1f5f9', color: '#94a3b8', fontSize: '0.68rem' }}>+{job.tags.length - 3}</span>
                      )}
                    </div>
                    <div className="mt-auto d-flex gap-2">
                      <button className="btn btn-sm flex-grow-1 rounded-pill fw-semibold py-2" style={{ background: appliedJobs.includes(job.id) ? '#f0fdf4' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: appliedJobs.includes(job.id) ? '#059669' : '#fff', border: appliedJobs.includes(job.id) ? '1.5px solid #10b981' : 'none', transition: '0.3s' }}
                        onMouseEnter={e => { if (!appliedJobs.includes(job.id)) { e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)'; } }}
                        onMouseLeave={e => { if (!appliedJobs.includes(job.id)) { e.currentTarget.style.boxShadow = 'none'; } }}
                        onClick={() => toggleApply(job.id)}>
                        {appliedJobs.includes(job.id) ? <><FaCheckCircle className="me-1" />Applied</> : <><FaPaperPlane className="me-1" />Apply</>}
                      </button>
                      <button className="btn btn-sm rounded-pill fw-semibold px-3" style={{ border: '1.5px solid #e2e8f0', color: '#475569', background: '#fff', transition: '0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.color = '#7c3aed'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#475569'; }}
                        onClick={() => setShowJobDetail(job)}>
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

      {/* JOB DETAIL MODAL - Animated */}
      {showJobDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }} onClick={() => setShowJobDetail(null)}>
          <div style={{ background: '#fff', borderRadius: 20, maxWidth: 520, width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }} onClick={e => e.stopPropagation()}>
            <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
            <div className="p-4 position-relative" style={{ background: 'linear-gradient(135deg, #2e1065, #7c3aed)', borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
              <div className="d-flex justify-content-between align-items-start position-relative">
                <div>
                  <span className="badge rounded-pill px-3 py-1 mb-2" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.7rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                    <FaBriefcase className="me-1" size={9} />{showJobDetail.category}
                  </span>
                  <h5 className="text-white fw-bold mb-1">{showJobDetail.title}</h5>
                  <div className="d-flex align-items-center gap-2">
                    <FaBuilding size={13} className="text-white-50" />
                    <span className="text-white-50" style={{ fontSize: '0.9rem' }}>{showJobDetail.company}</span>
                  </div>
                </div>
                <button className="btn btn-sm p-1 border-0 bg-transparent rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }} onClick={() => setShowJobDetail(null)}>
                  <FaTimes size={14} className="text-white" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <div className="p-2 rounded-3" style={{ background: '#f8f7ff' }}>
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>Location</small>
                    <span className="fw-semibold" style={{ fontSize: '0.88rem' }}><FaMapMarkerAlt className="me-1" style={{ color: '#7c3aed', fontSize: '0.75rem' }} />{showJobDetail.location}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 rounded-3" style={{ background: '#f0fdf4' }}>
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>Salary</small>
                    <span className="fw-bold" style={{ color: '#059669', fontSize: '0.88rem' }}><FaMoneyBillWave className="me-1" style={{ fontSize: '0.75rem' }} />{showJobDetail.salary}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 rounded-3" style={{ background: '#fff7ed' }}>
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>Job Type</small>
                    <span className="fw-semibold" style={{ fontSize: '0.88rem' }}><FaClock className="me-1" style={{ color: '#f59e0b', fontSize: '0.75rem' }} />{showJobDetail.type}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 rounded-3" style={{ background: '#f5f3ff' }}>
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>Work Type</small>
                    <span className="fw-semibold" style={{ fontSize: '0.88rem' }}><FaRedo className="me-1" style={{ color: '#7c3aed', fontSize: '0.75rem' }} />{showJobDetail.workType === 'daily' ? 'Daily Recurring' : showJobDetail.workType === 'weekly' ? 'Weekly Recurring' : showJobDetail.workType === 'flexible' ? 'Flexible Hours' : showJobDetail.workType === 'as-needed' ? 'As Needed' : 'One-Time'}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 rounded-3" style={{ background: '#fefce8' }}>
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>Deadline</small>
                    <span className="fw-semibold" style={{ fontSize: '0.88rem' }}><FaCalendarAlt className="me-1" style={{ color: '#ca8a04', fontSize: '0.75rem' }} />{showJobDetail.deadline}</span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-2 rounded-3" style={{ background: '#f0fdf4' }}>
                    <small className="text-muted d-block" style={{ fontSize: '0.7rem', lineHeight: 1.2 }}>Work Hours</small>
                    <span className="fw-semibold" style={{ fontSize: '0.88rem' }}><FaClock className="me-1" style={{ color: '#10b981', fontSize: '0.75rem' }} />{showJobDetail.hours}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {showJobDetail.description && (
                <div className="mb-3">
                  <h6 className="fw-bold mb-2" style={{ fontSize: '0.9rem' }}>Description</h6>
                  <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>{showJobDetail.description}</p>
                </div>
              )}

              {/* Shift Details */}
              {showJobDetail.shiftDuration && (
                <div className="p-3 rounded-3 mb-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <h6 className="fw-bold mb-2" style={{ fontSize: '0.85rem' }}><FaClock className="me-1" style={{ color: '#2563eb' }} />Shift Details</h6>
                  <div className="row g-2">
                    <div className="col-6"><small className="text-muted" style={{ fontSize: '0.72rem' }}>Duration</small><div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{showJobDetail.shiftDuration >= 60 ? `${Math.floor(showJobDetail.shiftDuration/60)}h ${showJobDetail.shiftDuration%60 ? showJobDetail.shiftDuration%60 + 'min' : ''}`.trim() : `${showJobDetail.shiftDuration}min`}</div></div>
                    <div className="col-6"><small className="text-muted" style={{ fontSize: '0.72rem' }}>Workers Needed</small><div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{showJobDetail.workersNeeded}</div></div>
                    {showJobDetail.days.length > 0 && (
                      <div className="col-12"><small className="text-muted" style={{ fontSize: '0.72rem' }}>Working Days</small><div className="fw-semibold" style={{ fontSize: '0.85rem' }}>{showJobDetail.days.join(', ')}</div></div>
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
                      <small className="fw-semibold" style={{ fontSize: '0.82rem', color: showJobDetail.workersHired >= showJobDetail.workersNeeded ? '#15803d' : '#a16207' }}>
                        {showJobDetail.workersHired} of {showJobDetail.workersNeeded} positions filled
                      </small>
                    </div>
                  </div>
                  <span className="badge rounded-pill px-3 py-1" style={{ background: showJobDetail.workersHired >= showJobDetail.workersNeeded ? '#dcfce7' : '#ede9fe', color: showJobDetail.workersHired >= showJobDetail.workersNeeded ? '#16a34a' : '#7c3aed', fontSize: '0.7rem', fontWeight: 600 }}>
                    {showJobDetail.workersHired >= showJobDetail.workersNeeded ? 'Full' : `${showJobDetail.workersNeeded - showJobDetail.workersHired} open`}
                  </span>
                </div>
                <div className="mt-2" style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((showJobDetail.workersHired / showJobDetail.workersNeeded) * 100, 100)}%`, height: '100%', background: showJobDetail.workersHired >= showJobDetail.workersNeeded ? '#10b981' : 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 10 }} />
                </div>
              </div>

              <h6 className="fw-bold mb-2" style={{ fontSize: '0.88rem' }}><FaStar className="me-1" style={{ color: '#f59e0b' }} />Required Skills</h6>
              <div className="d-flex flex-wrap gap-1 mb-4">
                {showJobDetail.tags.map((tag, i) => (
                  <span key={i} className="badge rounded-pill px-3 py-1" style={{ background: '#7c3aed12', color: '#7c3aed', fontSize: '0.75rem', fontWeight: 500 }}>{tag}</span>
                ))}
              </div>
              <div className="d-flex gap-2">
                <button className="btn flex-grow-1 rounded-pill fw-semibold py-2" style={{ background: appliedJobs.includes(showJobDetail.id) ? '#f0fdf4' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: appliedJobs.includes(showJobDetail.id) ? '#059669' : '#fff', border: appliedJobs.includes(showJobDetail.id) ? '1.5px solid #10b981' : 'none', transition: '0.3s' }}
                  onClick={() => { toggleApply(showJobDetail.id); setShowJobDetail(null); }}>
                  {appliedJobs.includes(showJobDetail.id) ? <><FaCheckCircle className="me-1" />Applied</> : <><FaPaperPlane className="me-1" />Apply Now</>}
                </button>
                <button className="btn rounded-pill fw-semibold py-2 px-3" style={{ border: '1.5px solid #e2e8f0', background: '#fff', transition: '0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#f59e0b' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0' }}
                  onClick={() => toggleSave(showJobDetail.id)}>
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
                {appsLoading ? (
                  <div className="text-center py-4"><div className="spinner-border spinner-border-sm text-primary" /></div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-4 text-muted" style={{ fontSize: '0.9rem' }}>
                    <FaPaperPlane size={32} className="mb-2 opacity-50" />
                    <p className="mb-0">No applications yet. Start applying to jobs!</p>
                  </div>
                ) : (
                  applications.map((app, i) => {
                    const cfg = statusConfig[app.status] || statusConfig.pending;
                    return (
                      <AnimSection key={app.id || i} delay={i * 0.1}>
                        <div className="d-flex align-items-center justify-content-between p-3 rounded-3" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                          <div>
                            <h6 className="fw-bold mb-0" style={{ fontSize: '0.95rem' }}>{app.job?.title || 'Job'}</h6>
                            <small className="text-muted">{app.job?.employer?.company_name || 'Company'} &middot; Applied {formatDate(app.applied_at)}</small>
                          </div>
                          <span className="badge rounded-pill px-3 py-1" style={{ background: cfg.bg, color: cfg.color, fontSize: '0.78rem', fontWeight: 600 }}>{cfg.label}</span>
                        </div>
                      </AnimSection>
                    );
                  })
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="col-lg-5">
              <AnimSection delay={0.2}>
                <div className="position-relative">
                  <h5 className="fw-bold mb-3"><FaBell className="me-2" style={{ color: '#f59e0b' }} />Notifications</h5>
                  <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>Get instant alerts for job updates, applications, and messages.</p>
                  <div className="d-flex flex-column gap-2">
                    <div className="p-3 rounded-3 text-center text-muted" style={{ background: '#fff', fontSize: '0.88rem' }}>
                      <FaBell size={24} className="mb-2 opacity-50" />
                      <p className="mb-0">No new notifications. We'll alert you when your application status changes or new jobs match your profile.</p>
                    </div>
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
