import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { employerService } from '../../services/employerService';
import { applicationService } from '../../services/applicationService';
import { BsArrowLeft, BsPerson, BsPeople, BsDownload, BsEnvelope, BsCalendarEvent, BsSearch, BsBriefcase, BsEye, BsClock, BsGeoAlt } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const STATUS_OPTIONS = ['pending', 'reviewed', 'shortlisted', 'interview', 'accepted', 'rejected'];

const statusBadge = (status) => {
  const map = {
    pending: 'bg-warning text-dark',
    reviewed: 'bg-info text-white',
    shortlisted: 'bg-purple text-white',
    interview: 'bg-orange text-white',
    accepted: 'bg-success text-white',
    rejected: 'bg-danger text-white',
  };
  return map[status?.toLowerCase()] || 'bg-secondary text-white';
};

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobRes, appsRes] = await Promise.all([
          employerService.getMyJobs(),
          employerService.getJobApplicants(jobId),
        ]);
        const jobList = jobRes.data?.data || jobRes.data || [];
        const foundJob = jobList.find((j) => j._id === jobId);
        setJob(foundJob || null);
        setApplicants(appsRes.data?.data || appsRes.data || []);
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
        const name = a.student?.name || a.user?.name || '';
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
  }), [applicants]);

  const handleStatusUpdate = async (appId, newStatus) => {
    try {
      await applicationService.updateStatus(appId, { status: newStatus });
      toast.success(`Status updated to ${newStatus}.`);
      setApplicants((prev) => prev.map((a) => a._id === appId ? { ...a, status: newStatus } : a));
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
          {[...Array(5)].map((_, i) => (
            <div key={i} className="col-12 placeholder-glow">
              <div className="card border-0 shadow-sm placeholder-glow" style={{ height: 72 }}>
                <div className="card-body d-flex align-items-center">
                  <div className="placeholder col-3" style={{ height: 20 }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
          <BsArrowLeft />
        </button>
        <div>
          <h4 className="fw-bold mb-0">{job?.title || 'Job'}</h4>
          <small className="text-muted">
            {job?.category && <><span className="badge bg-light text-dark me-2">{job.category}</span></>}
            {job?.type && <span className="badge bg-light text-dark me-2">{job.type}</span>}
            {job?.location && <><BsGeoAlt className="me-1" />{job.location}</>}
          </small>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm text-center py-3">
            <h3 className="fw-bold mb-0">{stats.total}</h3>
            <small className="text-muted">Total Applicants</small>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm text-center py-3">
            <h3 className="fw-bold mb-0 text-warning">{stats.pending}</h3>
            <small className="text-muted">Pending Review</small>
          </div>
        </div>
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm text-center py-3">
            <h3 className="fw-bold mb-0 text-success">{stats.shortlisted}</h3>
            <small className="text-muted">Shortlisted</small>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="input-group" style={{ maxWidth: 320 }}>
          <span className="input-group-text bg-white border-end-0"><BsSearch /></span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search by name or university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="status">By Status</option>
        </select>
      </div>

      {filteredApplicants.length > 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Student</th>
                  <th>University</th>
                  <th>Applied</th>
                  <th>Skills</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((app) => {
                  const student = app.student || app.user || {};
                  return (
                    <tr key={app._id}>
                      <td className="fw-semibold">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                            style={{ width: 36, height: 36 }}
                          >
                            <BsPerson className="text-primary" />
                          </div>
                          {student.name || 'N/A'}
                        </div>
                      </td>
                      <td className="text-muted small">{student.university || 'N/A'}</td>
                      <td className="text-muted small">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        {student.skills?.slice(0, 3).map((s, i) => (
                          <span key={i} className="badge bg-primary bg-opacity-10 text-primary me-1 mb-1">{s}</span>
                        ))}
                        {student.skills?.length > 3 && (
                          <span className="text-muted small">+{student.skills.length - 3}</span>
                        )}
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm ${statusBadge(app.status).split(' ')[0]}`}
                          style={{ width: 'auto', color: '#fff', minWidth: 120 }}
                          value={app.status?.toLowerCase() || 'pending'}
                          onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} style={{ color: '#000', backgroundColor: '#fff' }}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => setProfileModal({ show: true, student })}
                            title="View Profile"
                          >
                            <BsEye />
                          </button>
                          <button
                            className="btn btn-outline-success"
                            onClick={() => handleDownloadCV(student._id, student.name)}
                            title="Download CV"
                          >
                            <BsDownload />
                          </button>
                          <button
                            className="btn btn-outline-info"
                            onClick={() => setInterviewModal({ show: true, applicationId: app._id })}
                            title="Schedule Interview"
                          >
                            <BsCalendarEvent />
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleSendEmail(app)}
                            title="Send Email"
                          >
                            <BsEnvelope />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-5">
          <BsPeople size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No applicants found</h5>
          <p className="text-muted">
            {filterStatus !== 'all' || search ? 'Try adjusting your filters.' : 'No one has applied yet.'}
          </p>
          {filterStatus === 'all' && !search && (
            <Link to="/employer/manage-jobs" className="btn btn-primary">
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
                  className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3"
                  style={{ width: 64, height: 64 }}
                >
                  <BsPerson size={28} className="text-primary" />
                </div>
                <div>
                  <h5 className="fw-bold mb-0">{profileModal.student.name}</h5>
                  <small className="text-muted">{profileModal.student.email}</small>
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
  );
};

export default ViewApplicants;
