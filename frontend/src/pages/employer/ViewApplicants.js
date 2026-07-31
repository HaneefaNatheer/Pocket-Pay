import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { employerService } from '../../services/employerService';
import { applicationService } from '../../services/applicationService';
import {
  BsArrowLeft, BsPerson, BsPeople, BsDownload, BsEnvelope, BsCalendarEvent,
  BsSearch, BsBriefcase, BsEye, BsGeoAlt, BsClock, BsStar, BsCheckCircle,
  BsXCircle, BsFileEarmarkText, BsBuilding, BsFilter, BsSortDown,
} from 'react-icons/bs';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const STATUS_OPTIONS = ['pending', 'reviewed', 'shortlisted', 'interview', 'accepted', 'rejected'];

const STATUS_META = {
  pending: { icon: BsClock, color: '#f59e0b', label: 'Pending' },
  reviewed: { icon: BsEye, color: '#0ea5e9', label: 'Reviewed' },
  shortlisted: { icon: BsStar, color: '#8b5cf6', label: 'Shortlisted' },
  interview: { icon: BsCalendarEvent, color: '#f97316', label: 'Interview' },
  accepted: { icon: BsCheckCircle, color: '#22c55e', label: 'Accepted' },
  rejected: { icon: BsXCircle, color: '#ef4444', label: 'Rejected' },
};

const AVATAR_COLORS = ['#6f42c1', '#0d6efd', '#d63384', '#198754', '#fd7e14', '#0dcaf0', '#dc3545', '#20c997'];

const avatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const StatusPicker = ({ current, onChange }) => (
  <div className="d-flex flex-wrap gap-1">
    {STATUS_OPTIONS.map((s) => {
      const meta = STATUS_META[s];
      const Icon = meta.icon;
      const active = (current || 'pending').toLowerCase() === s;
      return (
        <button
          key={s}
          type="button"
          title={`Set status: ${meta.label}`}
          onClick={() => onChange(s)}
          className="d-inline-flex align-items-center gap-1"
          style={{
            border: active ? 'none' : '1px solid #e2e8f0',
            backgroundColor: active ? meta.color : '#fff',
            color: active ? '#fff' : '#94a3b8',
            fontSize: '0.72rem',
            fontWeight: 600,
            borderRadius: 999,
            padding: '4px 10px',
            transition: 'all .18s ease',
            animation: active ? 'statusPop .32s ease' : 'none',
            boxShadow: active ? `0 3px 10px ${meta.color}66` : 'none',
          }}
          onMouseEnter={(e) => {
            if (!active) {
              e.currentTarget.style.borderColor = meta.color;
              e.currentTarget.style.color = meta.color;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!active) {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
        <Icon size={12} /> {meta.label}
      </button>
    );
  })}
  </div>
);

const ActionBtn = ({ icon: Icon, color, title, onClick, disabled }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    disabled={disabled}
    className="d-inline-flex align-items-center justify-content-center"
    style={{
      width: 36,
      height: 36,
      borderRadius: 10,
      border: '1px solid #e2e8f0',
      backgroundColor: '#fff',
      color: '#64748b',
      transition: 'all .18s ease',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = `${color}1a`;
        e.currentTarget.style.color = color;
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }
    }}
    onMouseLeave={(e) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = '#fff';
        e.currentTarget.style.color = '#64748b';
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.transform = 'translateY(0)';
      }
    }}
  >
    <Icon size={16} />
  </button>
);

const ViewApplicants = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  const [profileModal, setProfileModal] = useState({ show: false, student: null });
  const [interviewModal, setInterviewModal] = useState({ show: false, applicationId: null });
  const [interviewForm, setInterviewForm] = useState({ date: '', time: '', location: '' });
  const [scheduling, setScheduling] = useState(false);

  const normalizeApp = (app) => {
    const student = app.student || {};
    return {
      ...app,
      _id: app._id || app.id,
      student: {
        ...student,
        _id: student._id || student.id,
        name: student.user?.name || student.name || 'N/A',
      },
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          employerService.getMyJobs(),
          employerService.getJobApplicants(jobId),
        ]);
        const jobList = jobRes.data?.data || jobRes.data || [];
        const foundJob = jobList.find((j) => (j.id || j._id) == jobId);
        setJob(foundJob || null);
        const rawApps = appsRes.data?.data || appsRes.data || [];
        setApplicants(rawApps.map(normalizeApp));
      } catch (err) {
        toast.error('Failed to load applicants.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId]);

  const filteredApplicants = useMemo(() => {
    let result = [...applicants];
    if (filterStatus !== 'all') {
      result = result.filter((a) => a.status?.toLowerCase() === filterStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => {
        const name = a.student?.name || '';
        const uni = a.student?.university || '';
        return name.toLowerCase().includes(q) || uni.toLowerCase().includes(q);
      });
    }
    if (sort === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === 'status') result.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    return result;
  }, [applicants, filterStatus, sort, search]);

  const stats = useMemo(() => ({
    total: applicants.length,
    pending: applicants.filter((a) => a.status?.toLowerCase() === 'pending').length,
    shortlisted: applicants.filter((a) => a.status?.toLowerCase() === 'shortlisted').length,
    accepted: applicants.filter((a) => a.status?.toLowerCase() === 'accepted').length,
  }), [applicants]);

  const handleStatusUpdate = async (appId, newStatus) => {
    const app = applicants.find((a) => a._id === appId);
    if (app && (app.status || 'pending').toLowerCase() === newStatus) return;
    const notes = window.prompt(
      `Add a message to send to the student about "${newStatus}" status:`,
      newStatus === 'accepted'
        ? 'Congratulations! You have been selected for this position.'
        : newStatus === 'rejected'
          ? 'We appreciate your interest, but you have not been selected this time.'
          : ''
    );
    if (notes === null) return;
    try {
      await applicationService.updateStatus(appId, { status: newStatus, employer_notes: notes.trim() || null });
      toast.success(`Status updated to ${STATUS_META[newStatus].label}.`);
      setApplicants((prev) => prev.map((a) => a._id === appId ? { ...a, status: newStatus, employer_notes: notes } : a));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDownloadCV = async (studentId, studentName) => {
    try {
      const res = await employerService.downloadCV(studentId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${studentName || 'student'}_CV.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to download CV.');
    }
  };

  const handleViewCV = (student) => {
    if (student?.cv_file) {
      window.open(`http://localhost:5000/${student.cv_file}`, '_blank');
    } else {
      toast.error('No CV uploaded by this student.');
    }
  };

  const handleScheduleInterview = async () => {
    if (!interviewForm.date || !interviewForm.time) {
      toast.error('Please select date and time.');
      return;
    }
    setScheduling(true);
    try {
      await applicationService.scheduleInterview(interviewModal.applicationId, {
        interviewDate: `${interviewForm.date}T${interviewForm.time}`,
        interviewLocation: interviewForm.location,
      });
      toast.success('Interview scheduled!');
      setInterviewModal({ show: false, applicationId: null });
      setInterviewForm({ date: '', time: '', location: '' });
      setApplicants((prev) => prev.map((a) =>
        a._id === interviewModal.applicationId ? { ...a, status: 'interview' } : a
      ));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to schedule interview.');
    } finally {
      setScheduling(false);
    }
  };

  const handleSendEmail = (applicant) => {
    const email = applicant.student?.email || applicant.user?.email || '';
    if (email) {
      window.location.href = `mailto:${email}`;
    } else {
      toast.error('No email found for this applicant.');
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="placeholder-glow mb-4">
          <div className="placeholder col-5 mb-2" style={{ height: 32 }}></div>
          <div className="placeholder col-8" style={{ height: 18 }}></div>
        </div>
        <div className="row g-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="col-12 placeholder-glow">
              <div className="card border-0 shadow-sm placeholder-glow" style={{ height: 110, borderRadius: 16 }}>
                <div className="card-body">
                  <div className="placeholder col-3" style={{ height: 20 }}></div>
                  <div className="placeholder col-6 mt-2" style={{ height: 16 }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-4" style={{ minHeight: '100vh', backgroundColor: '#f6f8fb' }}>
      <style>{`
        @keyframes statusPop { 0% { transform: scale(0.9); } 60% { transform: scale(1.1); } 100% { transform: scale(1); } }
      `}</style>
      <div className="container">
        <div className="d-flex align-items-center gap-3 mb-4">
          <button className="btn btn-outline-secondary btn-sm rounded-3 px-3 py-2 d-inline-flex align-items-center gap-1" onClick={() => navigate(-1)}>
            <BsArrowLeft /> Back
          </button>
          <div>
            <h4 className="fw-bold mb-1">{job?.title || 'Job'}</h4>
            <div className="d-flex flex-wrap align-items-center gap-2">
              {job?.employer?.company_name && (
                <span className="small text-muted d-inline-flex align-items-center gap-1">
                  <BsBuilding /> {job.employer.company_name}
                </span>
              )}
              {job?.category && <span className="badge bg-light text-dark">{job.category}</span>}
              {job?.type && <span className="badge bg-primary bg-opacity-10 text-primary">{job.type}</span>}
              {job?.location && (
                <span className="small text-muted d-inline-flex align-items-center gap-1">
                  <BsGeoAlt /> {job.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="row g-3 mb-4">
          {[
            { label: 'Total Applicants', value: stats.total, icon: BsPeople, color: '#0d6efd', bg: 'rgba(13,110,253,0.1)' },
            { label: 'Pending Review', value: stats.pending, icon: BsClock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Shortlisted', value: stats.shortlisted, icon: BsStar, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
            { label: 'Accepted', value: stats.accepted, icon: BsCheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          ].map((stat) => (
            <div className="col-6 col-md-3" key={stat.label}>
              <div className="card border-0 rounded-4 h-100" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.04)' }}>
                <div className="card-body d-flex align-items-center gap-3 p-3">
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: 44, height: 44, backgroundColor: stat.bg, color: stat.color }}>
                    <stat.icon size={22} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ fontSize: '1.35rem' }}>{stat.value}</h4>
                    <small className="text-muted">{stat.label}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
          <div className="input-group" style={{ maxWidth: 320 }}>
            <span className="input-group-text bg-white border-end-0 rounded-start-4"><BsSearch className="text-muted" /></span>
            <input
              type="text"
              className="form-control border-start-0"
              style={{ boxShadow: 'none' }}
              placeholder="Search by name or university..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="d-flex flex-wrap align-items-center gap-1">
            <span className="small text-muted me-1"><BsFilter className="me-1" />Status:</span>
            <button
              className={`btn btn-sm rounded-pill px-3 ${filterStatus === 'all' ? 'btn-dark' : 'btn-light'}`}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
            {STATUS_OPTIONS.map((s) => {
              const meta = STATUS_META[s];
              const active = filterStatus === s;
              return (
                <button
                  key={s}
                  className="btn btn-sm rounded-pill px-3"
                  style={{
                    border: 'none',
                    backgroundColor: active ? meta.color : '#fff',
                    color: active ? '#fff' : '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    transition: 'all .18s ease',
                    boxShadow: active ? `0 3px 8px ${meta.color}66` : '0 1px 2px rgba(15,23,42,0.06)',
                  }}
                  onClick={() => setFilterStatus(s)}
                >
                  {meta.label}
                </button>
              );
            })}
          </div>
          <div className="ms-auto d-flex align-items-center gap-2">
            <BsSortDown className="text-muted" />
            <select
              className="form-select form-select-sm rounded-pill"
              style={{ width: 'auto' }}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="status">By Status</option>
            </select>
          </div>
        </div>

        {filteredApplicants.length > 0 ? (
          <div>
            {filteredApplicants.map((app) => {
              const student = app.student || {};
              const appId = app.id || app._id;
              const color = avatarColor(student.name);
              return (
                <div key={appId} className="card border-0 rounded-4 mb-3" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.04)', transition: 'box-shadow .18s ease' }}>
                  <div className="card-body p-3 p-md-4">
                    <div className="d-flex flex-column flex-xl-row gap-3">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white flex-shrink-0"
                            style={{ width: 44, height: 44, backgroundColor: color, fontSize: '0.95rem' }}
                          >
                            {student.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || <BsPerson />}
                          </div>
                          <div className="min-w-0">
                            <div className="fw-semibold text-truncate">{student.name}</div>
                            <div className="small text-muted d-flex align-items-center gap-1 flex-wrap">
                              {student.university ? (
                                <>
                                  <BsBuilding size={12} /> {student.university}
                                </>
                              ) : 'University N/A'}
                              <span className="mx-1">•</span>
                              <span>Applied {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'recently'}</span>
                            </div>
                          </div>
                        </div>
                        {student.skills?.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {student.skills.slice(0, 4).map((s, i) => (
                              <span key={i} className="badge bg-light text-dark border rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>{s}</span>
                            ))}
                            {student.skills.length > 4 && (
                              <span className="small text-muted">+{student.skills.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 d-flex flex-column gap-2 align-items-start">
                        <StatusPicker current={app.status} onChange={(s) => handleStatusUpdate(appId, s)} />
                        <div className="d-flex flex-wrap align-items-center gap-2">
                          <ActionBtn icon={BsEye} color="#0d6efd" title="View Profile" onClick={() => setProfileModal({ show: true, student })} />
                          <ActionBtn icon={BsFileEarmarkText} color="#22c55e" title={student.cv_file ? 'View CV' : 'No CV uploaded'} disabled={!student.cv_file} onClick={() => handleViewCV(student)} />
                          <ActionBtn icon={BsDownload} color="#16a34a" title={student.cv_file ? 'Download CV' : 'No CV uploaded'} disabled={!student.cv_file} onClick={() => handleDownloadCV(student._id, student.name)} />
                          <ActionBtn icon={BsCalendarEvent} color="#f97316" title="Schedule Interview" onClick={() => setInterviewModal({ show: true, applicationId: appId })} />
                          <ActionBtn icon={BsEnvelope} color="#8b5cf6" title="Send Email" onClick={() => handleSendEmail(app)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-5 bg-white rounded-4" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
            <BsPeople size={48} className="text-muted mb-3" />
            <h5 className="text-muted fw-semibold">No applicants found</h5>
            <p className="text-muted mb-3">
              {filterStatus !== 'all' || search ? 'Try adjusting your filters.' : 'No one has applied yet.'}
            </p>
            {filterStatus === 'all' && !search && (
              <Link to="/employer/manage-jobs" className="btn btn-primary rounded-pill px-4">
                <BsBriefcase className="me-1" /> Manage Jobs
              </Link>
            )}
          </div>
        )}

        <Modal show={profileModal.show} onHide={() => setProfileModal({ show: false, student: null })} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Student Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {profileModal.student && (
              <div>
                <div className="d-flex align-items-center mb-4">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3 fw-bold text-white"
                    style={{ width: 64, height: 64, backgroundColor: avatarColor(profileModal.student.name || '?'), fontSize: '1.2rem' }}
                  >
                    {profileModal.student.name ? profileModal.student.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() : <BsPerson size={28} />}
                  </div>
                  <div>
                    <h5 className="fw-bold mb-0">{profileModal.student.name || 'N/A'}</h5>
                    <small className="text-muted">{profileModal.student.user?.email || profileModal.student.email || ''}</small>
                  </div>
                </div>
                <div className="row g-3">
                  <div className="col-6 col-md-4">
                    <small className="text-muted d-block">Phone</small>
                    <span className="fw-semibold">{profileModal.student.phone || 'N/A'}</span>
                  </div>
                  <div className="col-6 col-md-4">
                    <small className="text-muted d-block">University</small>
                    <span className="fw-semibold">{profileModal.student.university || 'N/A'}</span>
                  </div>
                  <div className="col-6 col-md-4">
                    <small className="text-muted d-block">Degree</small>
                    <span className="fw-semibold">{profileModal.student.degree || 'N/A'}</span>
                  </div>
                  <div className="col-6 col-md-4">
                    <small className="text-muted d-block">Year of Study</small>
                    <span className="fw-semibold">{profileModal.student.yearOfStudy || 'N/A'}</span>
                  </div>
                  <div className="col-12">
                    <small className="text-muted d-block mb-1">Bio</small>
                    <p className="mb-0">{profileModal.student.bio || 'No bio provided.'}</p>
                  </div>
                  <div className="col-12">
                    <small className="text-muted d-block mb-1">Skills</small>
                    <div>
                      {profileModal.student.skills?.map((s, i) => (
                        <span key={i} className="badge bg-primary bg-opacity-10 text-primary me-1 mb-1">{s}</span>
                      )) || <span className="text-muted small">No skills listed.</span>}
                    </div>
                  </div>
                  {profileModal.student.timetable?.length > 0 && (
                    <div className="col-12">
                      <small className="text-muted d-block mb-1">Availability (Timetable)</small>
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Day</th>
                              <th>Start</th>
                              <th>End</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileModal.student.timetable.map((t, i) => (
                              <tr key={i}>
                                <td>{t.day}</td>
                                <td>{t.startTime}</td>
                                <td>{t.endTime}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Modal.Body>
        </Modal>

        <Modal show={interviewModal.show} onHide={() => setInterviewModal({ show: false, applicationId: null })} centered>
          <Modal.Header closeButton>
            <Modal.Title>Schedule Interview</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Date *</label>
                <input
                  type="date"
                  className="form-control"
                  value={interviewForm.date}
                  onChange={(e) => setInterviewForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Time *</label>
                <input
                  type="time"
                  className="form-control"
                  value={interviewForm.time}
                  onChange={(e) => setInterviewForm((prev) => ({ ...prev, time: e.target.value }))}
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">Location</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Office address or Zoom link"
                  value={interviewForm.location}
                  onChange={(e) => setInterviewForm((prev) => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setInterviewModal({ show: false, applicationId: null })}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleScheduleInterview} disabled={scheduling}>
              {scheduling ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Scheduling...
                </>
              ) : (
                <>
                  <BsCalendarEvent className="me-1" />
                  Schedule
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ViewApplicants;
