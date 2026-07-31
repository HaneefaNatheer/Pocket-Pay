import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBriefcase, FaRocket, FaBuilding, FaShieldAlt, FaIdBadge,
  FaFileUpload, FaListUl, FaInbox, FaUsers, FaDownload, FaCalendarCheck,
  FaCheckCircle, FaEye, FaUserCheck, FaClock, FaChartLine,
  FaCheck, FaTimes, FaCalendarAlt, FaEdit, FaTrash, FaLock, FaUnlock,
  FaUserGraduate, FaMapMarkerAlt, FaPhone, FaEnvelope, FaFileAlt,
  FaMoneyBillWave, FaStar, FaPlusCircle, FaSave, FaSearch,
  FaCogs, FaHandshake,
} from 'react-icons/fa';
import api from '../services/api';
import { jobService } from '../services/jobService';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';

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

const postJobSections = [
  {
    title: 'Basic Details',
    icon: FaBriefcase,
    color: '#7c3aed',
    fields: ['Job Title', 'Company Name (Auto)', 'Job Category', 'Job Type', 'Number of Vacancies'],
  },
  {
    title: 'Job Information',
    icon: FaFileAlt,
    color: '#3b82f6',
    fields: ['Job Description', 'Responsibilities', 'Requirements (Age, Skills, Education, Experience)'],
  },
  {
    title: 'Work Details',
    icon: FaClock,
    color: '#10b981',
    fields: ['Working Days', 'Working Hours', 'Salary', 'Benefits (Food, Transport, etc.)'],
  },
  {
    title: 'Location',
    icon: FaMapMarkerAlt,
    color: '#f59e0b',
    fields: ['District', 'City', 'Address'],
  },
  {
    title: 'Contact',
    icon: FaPhone,
    color: '#ec4899',
    fields: ['Contact Person', 'Phone Number', 'Email Address'],
  },
  {
    title: 'Application',
    icon: FaCalendarAlt,
    color: '#8b5cf6',
    fields: ['Deadline', 'Required Documents (CV, NIC, Student ID)'],
  },
];

export default function EmployerServices() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manage');
  const [myJobs, setMyJobs] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState('');
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    title: '', category: '', job_type: 'onsite', workers_needed: '',
    description: '', requirements: '',
    available_days: [], available_hours_start: '', available_hours_end: '',
    salary_min: '', salary_type: 'monthly', benefits: '',
    location: '',
    contact_person: '', contact_phone: '', contact_email: '',
    deadline: '', required_documents: [],
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [editTarget, setEditTarget] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '', category: '', job_type: 'onsite', workers_needed: '',
    description: '', requirements: '',
    available_days: [], available_hours_start: '', available_hours_end: '',
    salary_min: '', salary_max: '', salary_type: 'monthly', benefits: '',
    location: '',
    contact_person: '', contact_phone: '', contact_email: '',
    deadline: '', required_documents: [],
  });

  const analytics = useMemo(() => {
    const views = myJobs.reduce((sum, j) => sum + (j.views_count || 0), 0);
    const applications = myJobs.reduce((sum, j) => sum + (j.current_applicants || 0), 0);
    const hired = myJobs.reduce((sum, j) => sum + (j.workers_hired || 0), 0);
    const active = myJobs.filter((j) => j.status?.toLowerCase() === 'active').length;
    return [
      { label: 'Total Views', value: views.toLocaleString(), icon: FaEye, color: '#7c3aed' },
      { label: 'Applications', value: applications.toLocaleString(), icon: FaInbox, color: '#3b82f6' },
      { label: 'Hired', value: hired.toLocaleString(), icon: FaUserCheck, color: '#10b981' },
      { label: 'Active Posts', value: active.toLocaleString(), icon: FaBriefcase, color: '#f59e0b' },
    ];
  }, [myJobs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setForm(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day],
    }));
  };

  const handleDocToggle = (doc) => {
    setForm(prev => ({
      ...prev,
      required_documents: prev.required_documents.includes(doc)
        ? prev.required_documents.filter(d => d !== doc)
        : [...prev.required_documents, doc],
    }));
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/employers/profile');
      const p = res.data.data;
      setProfile(p);
      setForm(prev => ({
        ...prev,
        contact_person: p.contact_person || '',
        contact_phone: p.company_phone || '',
        contact_email: p.company_email || '',
      }));
    } catch (err) {
    }
  };

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/employers/my-jobs');
      setMyJobs(res.data.data || []);
    } catch (err) {
      setMyJobs([]);
    }
  };

  useEffect(() => { fetchProfile(); fetchMyJobs(); }, []);

  const handlePostJob = async (asDraft = false) => {
    if (!form.title || !form.description || !form.category) {
      setSubmitMsg('Please fill in Title, Description, and Category.');
      setTimeout(() => setSubmitMsg(''), 4000);
      return;
    }
    setSubmitting(true);
    setSubmitMsg('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        category: form.category,
        job_type: form.job_type,
        workers_needed: parseInt(form.workers_needed) || 1,
        salary_min: parseFloat(form.salary_min) || null,
        salary_max: parseFloat(form.salary_min) || null,
        salary_type: form.salary_type,
        location: form.location,
        available_days: form.available_days.length > 0 ? form.available_days : null,
        available_hours_start: form.available_hours_start || null,
        available_hours_end: form.available_hours_end || null,
        benefits: form.benefits || null,
        contact_person: form.contact_person || null,
        contact_phone: form.contact_phone || null,
        contact_email: form.contact_email || null,
        deadline: form.deadline || null,
        required_documents: form.required_documents.length > 0 ? form.required_documents : null,
        status: asDraft ? 'draft' : 'active',
      };
      const res = await api.post('/jobs', payload);
      setSubmitMsg(asDraft ? 'Job saved as draft!' : 'Job published successfully!');
      setForm({ title: '', category: '', job_type: 'onsite', workers_needed: '', description: '', requirements: '', available_days: [], available_hours_start: '', available_hours_end: '', salary_min: '', salary_type: 'monthly', benefits: '', location: '', contact_person: '', contact_phone: '', contact_email: '', deadline: '', required_documents: [] });
      fetchMyJobs();
      setTimeout(() => { setSubmitMsg(''); setActiveTab('manage'); }, 2000);
    } catch (err) {
      setSubmitMsg(err.response?.data?.message || 'Failed to post job. Make sure you are logged in as employer.');
      setTimeout(() => setSubmitMsg(''), 5000);
    }
    setSubmitting(false);
  };

  const handleDeleteJob = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await jobService.delete(deleteTarget.id || deleteTarget._id);
      toast.success('Job deleted.');
      setDeleteTarget(null);
      fetchMyJobs();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete job.');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditDayToggle = (day) => {
    setEditForm(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day],
    }));
  };

  const handleEditDocToggle = (doc) => {
    setEditForm(prev => ({
      ...prev,
      required_documents: prev.required_documents.includes(doc)
        ? prev.required_documents.filter(d => d !== doc)
        : [...prev.required_documents, doc],
    }));
  };

  const openEdit = (job) => {
    setEditForm({
      title: job.title || '',
      category: job.category || '',
      job_type: job.job_type || 'onsite',
      workers_needed: job.workers_needed || '',
      description: job.description || '',
      requirements: job.requirements || '',
      available_days: job.available_days || [],
      available_hours_start: job.available_hours_start || '',
      available_hours_end: job.available_hours_end || '',
      salary_min: job.salary_min || '',
      salary_max: job.salary_max || '',
      salary_type: job.salary_type || 'monthly',
      benefits: job.benefits || '',
      location: job.location || '',
      contact_person: job.contact_person || '',
      contact_phone: job.contact_phone || '',
      contact_email: job.contact_email || '',
      deadline: job.deadline ? new Date(job.deadline).toISOString().slice(0, 10) : '',
      required_documents: job.required_documents || [],
    });
    setEditTarget(job);
  };

  const handleUpdateJob = async () => {
    if (!editTarget) return;
    if (!editForm.title || !editForm.description || !editForm.category) {
      toast.error('Please fill in Title, Description, and Category.');
      return;
    }
    setSavingEdit(true);
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        requirements: editForm.requirements,
        category: editForm.category,
        job_type: editForm.job_type,
        workers_needed: parseInt(editForm.workers_needed) || 1,
        salary_min: parseFloat(editForm.salary_min) || null,
        salary_max: parseFloat(editForm.salary_max) || null,
        salary_type: editForm.salary_type,
        location: editForm.location,
        available_days: editForm.available_days.length > 0 ? editForm.available_days : null,
        available_hours_start: editForm.available_hours_start || null,
        available_hours_end: editForm.available_hours_end || null,
        benefits: editForm.benefits || null,
        contact_person: editForm.contact_person || null,
        contact_phone: editForm.contact_phone || null,
        contact_email: editForm.contact_email || null,
        deadline: editForm.deadline || null,
        required_documents: editForm.required_documents.length > 0 ? editForm.required_documents : null,
      };
      await jobService.update(editTarget.id || editTarget._id, payload);
      toast.success('Job updated successfully!');
      setEditTarget(null);
      fetchMyJobs();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update job.');
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="home-page">

      {/* ============ HERO ============ */}
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
                  <FaBriefcase className="me-2" />
                  Employer Services
                </span>
                <h1 className="hero-title mb-3">
                  Post Jobs & <span className="text-gradient">Hire Students</span>
                </h1>
                <p className="hero-subtitle mb-0">
                  Post shop assistant, waiter, delivery rider, cashier, and more — hire talented students on your schedule.
                </p>
              </AnimSection>
            </div>
          </div>
        </div>
      </section>

      {/* ============ EMPLOYER DASHBOARD ============ */}
      <section className="py-5" style={{ background: 'linear-gradient(180deg, #f8f7ff 0%, #ffffff 100%)' }}>
        <div className="container">
          <AnimSection>
            <div className="text-center mb-5">
              <span className="section-badge" style={{ background: '#2563eb15', color: '#2563eb' }}>
                <FaChartLine className="me-2" />Overview
              </span>
              <h2 className="section-title">Employer <span className="text-gradient">Services</span></h2>
              <p className="section-subtitle">Post daily wage, part-time, and freelance jobs — manage listings and hire students at a glance.</p>
            </div>
          </AnimSection>

          <div className="row g-3 mb-5">
            {analytics.map((stat, i) => (
              <div key={i} className="col-lg-3 col-6">
                <AnimSection delay={i * 0.1}>
                  <div className="p-4 rounded-4 text-center position-relative overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0', transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.2)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${stat.color}, ${stat.color}88)` }} />
                    <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: 52, height: 52, background: `${stat.color}12` }}>
                      <stat.icon size={22} style={{ color: stat.color }} />
                    </div>
                    <h3 className="fw-bold mb-0" style={{ fontSize: '1.75rem' }}>{stat.value}</h3>
                    <small className="text-muted" style={{ fontSize: '0.85rem' }}>{stat.label}</small>
                  </div>
                </AnimSection>
              </div>
            ))}
          </div>

          {/* Tab Switcher */}
          <AnimSection delay={0.15}>
            <div className="d-flex gap-2 mb-4 justify-content-center">
              {[
                { key: 'manage', label: 'Manage Posted Jobs', icon: FaListUl },
                { key: 'post', label: 'Post New Job', icon: FaPlusCircle },
              ].map(tab => (
                <button
                  key={tab.key}
                  className="btn rounded-pill px-4 py-2 fw-semibold"
                  style={{
                    background: activeTab === tab.key ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : '#f1f5f9',
                    color: activeTab === tab.key ? '#fff' : '#475569',
                    border: 'none',
                    boxShadow: activeTab === tab.key ? '0 4px 16px rgba(37,99,235,0.3)' : 'none',
                    transform: activeTab === tab.key ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  onMouseEnter={e => { if (activeTab !== tab.key) { e.currentTarget.style.background = '#e2e8f0'; } }}
                  onMouseLeave={e => { if (activeTab !== tab.key) { e.currentTarget.style.background = '#f1f5f9'; } }}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <tab.icon className="me-1" />{tab.label}
                </button>
              ))}
            </div>
          </AnimSection>

          {/* ============ MANAGE POSTED JOBS ============ */}
          {activeTab === 'manage' && (
            <div>
              <AnimSection delay={0.05}>
                <div className="mb-3">
                  <h5 className="fw-bold"><FaListUl className="me-2" style={{ color: '#2563eb' }} />Manage Posted Jobs</h5>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>All your posted jobs appear here. View, edit, close, or manage applicants from one place.</p>
                </div>
              </AnimSection>

              {myJobs.length === 0 && (
                <AnimSection delay={0.1}>
                  <div className="text-center p-5 rounded-4" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
                    <div style={{ opacity: 0.5 }}>
                      <FaBriefcase size={48} className="text-muted mb-3" />
                    </div>
                    <h6 className="fw-bold" style={{ color: '#475569' }}>No jobs posted yet</h6>
                    <p className="text-muted mb-3" style={{ fontSize: '0.88rem' }}>Click "Post New Job" to create your first listing and start attracting candidates.</p>
                    <button className="btn rounded-pill px-4 fw-semibold" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none' }}
                      onClick={() => setActiveTab('post')}>
                      <FaPlusCircle className="me-1" /> Post Your First Job
                    </button>
                  </div>
                </AnimSection>
              )}

              <div className="d-flex flex-column gap-3">
                {myJobs.map((job, i) => (
                  <AnimSection key={job.id} delay={(i + 1) * 0.1}>
                    <div className="p-4 rounded-4 position-relative overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0', transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.15)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: job.status === 'active' ? 'linear-gradient(90deg, #10b981, #34d399)' : job.status === 'draft' ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #6b7280, #9ca3af)' }} />
                      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
                        <div className="d-flex align-items-start gap-3">
                          <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 48, height: 48, background: job.status === 'active' ? '#10b98112' : job.status === 'draft' ? '#f59e0b12' : '#6b728012' }}>
                            <FaBriefcase size={20} style={{ color: job.status === 'active' ? '#10b981' : job.status === 'draft' ? '#f59e0b' : '#6b7280' }} />
                          </div>
                          <div>
                            <h6 className="fw-bold mb-1">{job.title}</h6>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <FaBuilding size={11} className="text-muted" />
                              <small className="text-muted">{job.employer?.company_name || 'Company'}</small>
                            </div>
                            <small className="text-muted" style={{ fontSize: '0.78rem' }}>
                              <FaCalendarAlt size={10} className="me-1" />
                              Posted {job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                            </small>
                          </div>
                        </div>
                        <span className="badge rounded-pill px-3 py-1 align-self-start" style={{
                          background: job.status === 'active' ? '#f0fdf4' : job.status === 'draft' ? '#fffbeb' : '#f3f4f6',
                          color: job.status === 'active' ? '#059669' : job.status === 'draft' ? '#d97706' : '#6b7280',
                          fontSize: '0.78rem', fontWeight: 600,
                        }}>
                          {job.status === 'active' ? 'Active' : job.status === 'draft' ? 'Draft' : job.status}
                        </span>
                      </div>

                      <div className="d-flex flex-wrap gap-3 mt-3 pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                        <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.8rem', color: '#475569' }}>
                          <FaUsers size={12} style={{ color: '#7c3aed' }} /> {job.current_applicants || 0} Applications
                        </span>
                        <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.8rem', color: '#475569' }}>
                          <FaEye size={12} style={{ color: '#3b82f6' }} /> {job.views_count || 0} Views
                        </span>
                        {job.salary_min && (
                          <span className="d-flex align-items-center gap-1" style={{ fontSize: '0.8rem', color: '#475569' }}>
                            <FaMoneyBillWave size={12} style={{ color: '#10b981' }} /> LKR {Number(job.salary_min).toLocaleString()}{job.salary_type === 'hourly' ? '/hr' : job.salary_type === 'daily' ? '/day' : '/mo'}
                          </span>
                        )}
                      </div>

                      <div className="d-flex flex-wrap gap-2 mt-3">
                        <button type="button" className="btn btn-sm rounded-pill px-3 fw-semibold" style={{ background: '#eff6ff', color: '#2563eb', border: 'none', transition: '0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; }}
                          onClick={() => navigate(`/jobs/${job.id || job._id}`)}>
                          <FaEye className="me-1" />View
                        </button>
                        <button type="button" className="btn btn-sm rounded-pill px-3 fw-semibold" style={{ background: '#fffbeb', color: '#d97706', border: 'none', transition: '0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fef3c7'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fffbeb'; }}
                          onClick={() => openEdit(job)}>
                          <FaEdit className="me-1" />Edit
                        </button>
                        <button type="button" className="btn btn-sm rounded-pill px-3 fw-semibold" style={{ background: '#fef2f2', color: '#ef4444', border: 'none', transition: '0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; }}
                          onClick={() => setDeleteTarget(job)}>
                          <FaTrash className="me-1" />Delete
                        </button>
                        <button type="button" className="btn btn-sm rounded-pill px-3 fw-semibold" style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', border: 'none', transition: '0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(124,58,237,0.35)'; }}
                          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                          onClick={() => navigate(`/employer/applicants/${job.id || job._id}`)}>
                          <FaUsers className="me-1" />View Applicants
                        </button>
                      </div>
                    </div>
                  </AnimSection>
                ))}
              </div>
            </div>
          )}

          {/* ============ POST NEW JOB ============ */}
          {activeTab === 'post' && (
            <div>
              <AnimSection delay={0.05}>
                <div className="mb-4">
                  <h5 className="fw-bold"><FaPlusCircle className="me-2" style={{ color: '#2563eb' }} />Post New Job</h5>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Fill in the details below to publish a new job listing for students.</p>
                </div>
              </AnimSection>

              <div className="d-flex flex-column gap-4">

                {/* 1. Basic Details */}
                <AnimSection delay={0.08}>
                  <div className="rounded-4 p-4 position-relative overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0', transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.06)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: '#7c3aed12' }}>
                        <FaBriefcase size={18} style={{ color: '#7c3aed' }} />
                      </div>
                      <h6 className="fw-bold mb-0">1. Basic Details</h6>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Job Title *</label><input type="text" className="form-control rounded-3" name="title" value={form.title} onChange={handleChange} placeholder="e.g. Barista, Web Developer" /></div>
                      <div className="col-md-6"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Company Name</label><input type="text" className="form-control rounded-3" value={profile?.company_name || 'Loading...'} disabled style={{ background: '#f8fafc' }} /></div>
                      <div className="col-md-4"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Job Category *</label><select className="form-select rounded-3" name="category" value={form.category} onChange={handleChange}><option value="">Select category</option><option value="daily-wage">Daily Wage / Flexible</option><option value="promotion">Promotion & Event</option><option value="education">Education</option><option value="office-support">Office Support</option><option value="delivery-transport">Delivery & Transport</option><option value="retail">Retail</option><option value="hotel-tourism">Hotel & Tourism</option><option value="freelance">Freelance / Skill-Based</option></select></div>
                      <div className="col-md-4"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Job Type</label><select className="form-select rounded-3" name="job_type" value={form.job_type} onChange={handleChange}><option value="onsite">On-Site</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option></select></div>
                      <div className="col-md-4"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Number of Vacancies</label><input type="number" className="form-control rounded-3" name="workers_needed" value={form.workers_needed} onChange={handleChange} placeholder="e.g. 3" min="1" /></div>
                    </div>
                  </div>
                </AnimSection>

                {/* 2. Job Information */}
                <AnimSection delay={0.16}>
                  <div className="rounded-4 p-4 position-relative overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0', transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(59,130,246,0.06)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: '#3b82f612' }}>
                        <FaFileAlt size={18} style={{ color: '#3b82f6' }} />
                      </div>
                      <h6 className="fw-bold mb-0">2. Job Information</h6>
                    </div>
                    <div className="row g-3">
                      <div className="col-12"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Job Description *</label><textarea className="form-control rounded-3" rows="3" name="description" value={form.description} onChange={handleChange} placeholder="Describe the job role and what the student will be doing..." /></div>
                      <div className="col-12"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Requirements (Age, Skills, Education, Experience)</label><textarea className="form-control rounded-3" rows="3" name="requirements" value={form.requirements} onChange={handleChange} placeholder="e.g. Age 18+, Basic English, Currently studying IT..." /></div>
                    </div>
                  </div>
                </AnimSection>

                {/* 3. Work Details */}
                <AnimSection delay={0.24}>
                  <div className="rounded-4 p-4 position-relative overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0', transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(16,185,129,0.06)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: '#10b98112' }}>
                        <FaClock size={18} style={{ color: '#10b981' }} />
                      </div>
                      <h6 className="fw-bold mb-0">3. Work Details</h6>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Working Days</label>
                        <div className="d-flex flex-wrap gap-2">
                          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                            <button key={d} type="button" className="btn btn-sm rounded-pill px-3 py-1 fw-semibold" style={{ background: form.available_days.includes(d) ? '#2563eb' : '#f1f5f9', color: form.available_days.includes(d) ? '#fff' : '#475569', border: 'none', fontSize: '0.8rem' }} onClick={() => handleDayToggle(d)}>{d}</button>
                          ))}
                        </div>
                      </div>
                      <div className="col-md-6"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Working Hours</label><div className="row g-2"><div className="col-6"><input type="time" className="form-control rounded-3" name="available_hours_start" value={form.available_hours_start} onChange={handleChange} /></div><div className="col-6"><input type="time" className="form-control rounded-3" name="available_hours_end" value={form.available_hours_end} onChange={handleChange} /></div></div></div>
                      <div className="col-md-4"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Salary (LKR)</label><input type="number" className="form-control rounded-3" name="salary_min" value={form.salary_min} onChange={handleChange} placeholder="e.g. 25000" /></div>
                      <div className="col-md-4"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Salary Type</label><select className="form-select rounded-3" name="salary_type" value={form.salary_type} onChange={handleChange}><option value="monthly">Monthly</option><option value="hourly">Hourly</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="fixed">Per Project</option></select></div>
                      <div className="col-md-4"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Benefits</label><input type="text" className="form-control rounded-3" name="benefits" value={form.benefits} onChange={handleChange} placeholder="e.g. Food, Transport" /></div>
                    </div>
                  </div>
                </AnimSection>

                {/* 4. Location */}
                <AnimSection delay={0.32}>
                  <div className="rounded-4 p-4 position-relative overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0', transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.06)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' }} />
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: '#f59e0b12' }}>
                        <FaMapMarkerAlt size={18} style={{ color: '#f59e0b' }} />
                      </div>
                      <h6 className="fw-bold mb-0">4. Location</h6>
                    </div>
                    <div className="row g-3">
                      <div className="col-12"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Address / District</label><input type="text" className="form-control rounded-3" name="location" value={form.location} onChange={handleChange} placeholder="e.g. Colombo, Nugegoda" /></div>
                    </div>
                  </div>
                </AnimSection>

                {/* 5. Contact */}
                <AnimSection delay={0.40}>
                  <div className="rounded-4 p-4 position-relative overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0', transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(236,72,153,0.06)'; e.currentTarget.style.borderColor = 'rgba(236,72,153,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #ec4899, #f472b6)' }} />
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: '#ec489912' }}>
                        <FaPhone size={18} style={{ color: '#ec4899' }} />
                      </div>
                      <h6 className="fw-bold mb-0">5. Contact</h6>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-4"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Contact Person</label><input type="text" className="form-control rounded-3" name="contact_person" value={form.contact_person} onChange={handleChange} placeholder="Name" /></div>
                      <div className="col-md-4"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Phone Number</label><input type="tel" className="form-control rounded-3" name="contact_phone" value={form.contact_phone} onChange={handleChange} placeholder="07X XXX XXXX" /></div>
                      <div className="col-md-4"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Email Address</label><input type="email" className="form-control rounded-3" name="contact_email" value={form.contact_email} onChange={handleChange} placeholder="email@company.com" /></div>
                    </div>
                  </div>
                </AnimSection>

                {/* 6. Application */}
                <AnimSection delay={0.48}>
                  <div className="rounded-4 p-4 position-relative overflow-hidden" style={{ background: '#fff', border: '1px solid #e2e8f0', transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(139,92,246,0.06)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' }} />
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: 42, height: 42, background: '#8b5cf612' }}>
                        <FaCalendarAlt size={18} style={{ color: '#8b5cf6' }} />
                      </div>
                      <h6 className="fw-bold mb-0">6. Application</h6>
                    </div>
                    <div className="row g-3">
                      <div className="col-md-6"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Application Deadline</label><input type="date" className="form-control rounded-3" name="deadline" value={form.deadline} onChange={handleChange} /></div>
                      <div className="col-md-6"><label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Required Documents</label>
                        <div className="d-flex flex-wrap gap-2 mt-1">
                          {['CV', 'NIC', 'Student ID'].map((doc) => (
                            <button key={doc} type="button" className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold" style={{ background: form.required_documents.includes(doc) ? '#7c3aed' : '#f8fafc', color: form.required_documents.includes(doc) ? '#fff' : '#475569', border: `1px solid ${form.required_documents.includes(doc) ? '#7c3aed' : '#e2e8f0'}`, cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => handleDocToggle(doc)}>
                              {form.required_documents.includes(doc) && <FaCheck size={12} />} {doc}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimSection>

              </div>

              {submitMsg && (
                <div className="text-center mt-3 p-3 rounded-3 fw-semibold d-flex align-items-center justify-content-center gap-2" style={{ background: submitMsg.includes('failed') || submitMsg.includes('Failed') ? '#fef2f2' : '#f0fdf4', color: submitMsg.includes('failed') || submitMsg.includes('Failed') ? '#dc2626' : '#16a34a', fontSize: '0.9rem', border: `1px solid ${submitMsg.includes('failed') || submitMsg.includes('Failed') ? '#fecaca' : '#bbf7d0'}` }}>
                  {submitMsg.includes('failed') || submitMsg.includes('Failed') ? <FaTimes /> : <FaCheckCircle />}
                  {submitMsg}
                </div>
              )}

              {/* Publish / Save Draft Buttons */}
              <AnimSection delay={0.56}>
                <div className="d-flex gap-3 justify-content-center mt-4">
                  <button className="btn rounded-pill px-5 py-2 fw-semibold" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontSize: '1rem', border: 'none', boxShadow: '0 4px 16px rgba(37,99,235,0.3)', transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }} disabled={submitting} onClick={() => handlePostJob(false)}
                    onMouseEnter={e => { if (!submitting) { e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.45)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    {submitting ? 'Publishing...' : <><FaCheck className="me-2" />Publish Job</>}
                  </button>
                  <button className="btn rounded-pill px-5 py-2 fw-semibold" style={{ background: '#f1f5f9', color: '#475569', fontSize: '1rem', border: '1px solid #e2e8f0', transition: 'all 0.2s' }} disabled={submitting} onClick={() => handlePostJob(true)}
                    onMouseEnter={e => { if (!submitting) { e.currentTarget.style.background = '#e2e8f0'; } }}
                    onMouseLeave={e => { if (!submitting) { e.currentTarget.style.background = '#f1f5f9'; } }}>
                    <FaSave className="me-2" />Save as Draft
                  </button>
                </div>
              </AnimSection>
            </div>
          )}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="cta-section py-5">
        <div className="container">
          <AnimSection>
            <div className="cta-card p-5 text-center">
              <h2 className="cta-title mb-3">Ready to Start Hiring?</h2>
              <p className="cta-subtitle mb-4">Join hundreds of employers already on Pocket-Pay.</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <button className="btn px-5 py-2 rounded-pill fw-semibold" style={{ background: '#2563eb', color: '#fff', fontSize: '1.1rem' }} onClick={() => navigate('/register/employer')}>
                  <FaBriefcase className="me-2" />Register as Employer
                </button>
                <button className="btn btn-outline-dark btn-lg px-5" onClick={() => navigate('/services/student')}>
                  <FaUserGraduate className="me-2" />Explore Student Features
                </button>
              </div>
            </div>
          </AnimSection>
        </div>
      </section>

      <Modal show={!!deleteTarget} onHide={() => setDeleteTarget(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete "<strong>{deleteTarget?.title}</strong>"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteJob} disabled={deleting}>
            {deleting ? <><span className="spinner-border spinner-border-sm me-2"></span>Deleting...</> : <><FaTrash className="me-1" />Delete</>}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!editTarget} onHide={() => setEditTarget(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title><FaEdit className="me-2" style={{ color: '#d97706' }} />Edit Job</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Job Title *</label>
              <input type="text" className="form-control rounded-3" name="title" value={editForm.title} onChange={handleEditChange} placeholder="e.g. Barista, Web Developer" />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Job Category *</label>
              <select className="form-select rounded-3" name="category" value={editForm.category} onChange={handleEditChange}>
                <option value="">Select category</option>
                <option value="daily-wage">Daily Wage / Flexible</option>
                <option value="promotion">Promotion & Event</option>
                <option value="education">Education</option>
                <option value="office-support">Office Support</option>
                <option value="delivery-transport">Delivery & Transport</option>
                <option value="retail">Retail</option>
                <option value="hotel-tourism">Hotel & Tourism</option>
                <option value="freelance">Freelance / Skill-Based</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Job Type</label>
              <select className="form-select rounded-3" name="job_type" value={editForm.job_type} onChange={handleEditChange}>
                <option value="onsite">On-Site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Number of Vacancies</label>
              <input type="number" className="form-control rounded-3" name="workers_needed" value={editForm.workers_needed} onChange={handleEditChange} placeholder="e.g. 3" min="1" />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Job Description *</label>
              <textarea className="form-control rounded-3" rows="3" name="description" value={editForm.description} onChange={handleEditChange} placeholder="Describe the job role..." />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Requirements</label>
              <textarea className="form-control rounded-3" rows="2" name="requirements" value={editForm.requirements} onChange={handleEditChange} placeholder="e.g. Age 18+, Basic English..." />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Salary Min (LKR)</label>
              <input type="number" className="form-control rounded-3" name="salary_min" value={editForm.salary_min} onChange={handleEditChange} placeholder="e.g. 25000" />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Salary Max (LKR)</label>
              <input type="number" className="form-control rounded-3" name="salary_max" value={editForm.salary_max} onChange={handleEditChange} placeholder="e.g. 30000" />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Salary Type</label>
              <select className="form-select rounded-3" name="salary_type" value={editForm.salary_type} onChange={handleEditChange}>
                <option value="monthly">Monthly</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="fixed">Per Project</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Location</label>
              <input type="text" className="form-control rounded-3" name="location" value={editForm.location} onChange={handleEditChange} placeholder="e.g. Colombo, Nugegoda" />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Working Days</label>
              <div className="d-flex flex-wrap gap-2">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <button key={d} type="button" className="btn btn-sm rounded-pill px-3 py-1 fw-semibold" style={{ background: editForm.available_days.includes(d) ? '#2563eb' : '#f1f5f9', color: editForm.available_days.includes(d) ? '#fff' : '#475569', border: 'none', fontSize: '0.8rem' }} onClick={() => handleEditDayToggle(d)}>{d}</button>
                ))}
              </div>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Working Hours</label>
              <div className="row g-2">
                <div className="col-6"><input type="time" className="form-control rounded-3" name="available_hours_start" value={editForm.available_hours_start} onChange={handleEditChange} /></div>
                <div className="col-6"><input type="time" className="form-control rounded-3" name="available_hours_end" value={editForm.available_hours_end} onChange={handleEditChange} /></div>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Benefits</label>
              <input type="text" className="form-control rounded-3" name="benefits" value={editForm.benefits} onChange={handleEditChange} placeholder="e.g. Food, Transport" />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Contact Person</label>
              <input type="text" className="form-control rounded-3" name="contact_person" value={editForm.contact_person} onChange={handleEditChange} placeholder="Name" />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Phone Number</label>
              <input type="tel" className="form-control rounded-3" name="contact_phone" value={editForm.contact_phone} onChange={handleEditChange} placeholder="07X XXX XXXX" />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Email Address</label>
              <input type="email" className="form-control rounded-3" name="contact_email" value={editForm.contact_email} onChange={handleEditChange} placeholder="email@company.com" />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Application Deadline</label>
              <input type="date" className="form-control rounded-3" name="deadline" value={editForm.deadline} onChange={handleEditChange} />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem' }}>Required Documents</label>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {['CV', 'NIC', 'Student ID'].map((doc) => (
                  <button key={doc} type="button" className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 fw-semibold" style={{ background: editForm.required_documents.includes(doc) ? '#7c3aed' : '#f8fafc', color: editForm.required_documents.includes(doc) ? '#fff' : '#475569', border: `1px solid ${editForm.required_documents.includes(doc) ? '#7c3aed' : '#e2e8f0'}`, cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => handleEditDocToggle(doc)}>
                    {editForm.required_documents.includes(doc) && <FaCheck size={12} />} {doc}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditTarget(null)}>Cancel</Button>
          <Button variant="warning" onClick={handleUpdateJob} disabled={savingEdit}>
            {savingEdit ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><FaSave className="me-1" />Save Changes</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
