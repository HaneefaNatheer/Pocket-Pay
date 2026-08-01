import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import {
  BsEye, BsXCircle, BsBriefcase, BsTelephone, BsPerson, BsMegaphone,
  BsCalendarEvent, BsCashCoin, BsGeoAlt, BsBuilding, BsExclamationTriangle,
  BsClock,
} from 'react-icons/bs';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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

const SALARY_SUFFIX = { hourly: '/hr', daily: '/day', weekly: '/wk', monthly: '/mo', fixed: '' };

const formatSalary = (job) => {
  const suffix = SALARY_SUFFIX[job?.salary_type] ?? '/hr';
  const num = (v) => (v == null ? null : Number(v).toLocaleString());
  if (job?.salary_min && job?.salary_max) return `$${num(job.salary_min)} - $${num(job.salary_max)}${suffix}`;
  if (job?.salary_min) return `From $${num(job.salary_min)}${suffix}`;
  if (job?.salary_max) return `Up to $${num(job.salary_max)}${suffix}`;
  return null;
};

const contactInfo = (app) => {
  const job = app?.job || {};
  return {
    person: job.contact_person || job.employer?.contact_person || 'Not provided',
    phone: job.contact_phone || job.employer?.company_phone || 'Not provided',
    email: job.contact_email || job.employer?.company_email || '',
  };
};

const newsItems = (app) => {
  const items = [];
  if (app?.employer_notes) {
    items.push({ title: 'Employer Message', body: app.employer_notes, color: 'primary' });
  }
  if (app?.status?.toLowerCase() === 'interview') {
    const when = app.interview_date ? new Date(app.interview_date).toLocaleString() : 'Date TBA';
    const body = `${when}${app.interview_location ? ` at ${app.interview_location}` : ''}`.trim();
    items.push({ title: 'Interview Scheduled', body, color: 'success' });
  }
  if (app?.job?.is_urgent) {
    items.push({ title: 'Urgent Job', body: 'This job is marked urgent - the employer is hiring quickly.', color: 'danger' });
  }
  return items;
};

const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [viewApp, setViewApp] = useState(null);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await applicationService.getMyApplications();
      setApplications(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApps(); }, []);

  const filteredApps = applications?.filter((app) =>
    filterStatus === 'all' || app.status?.toLowerCase() === filterStatus
  ) || [];

  const newsApps = filteredApps.filter((app) => newsItems(app).length > 0).slice(0, 3);

  const statuses = ['all', 'pending', 'reviewed', 'shortlisted', 'interview', 'accepted', 'rejected'];

  const handleWithdraw = async () => {
    if (!selectedAppId) return;
    setWithdrawing(true);
    try {
      await applicationService.withdraw(selectedAppId);
      toast.success('Application withdrawn.');
      setShowWithdrawModal(false);
      setSelectedAppId(null);
      fetchApps();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to withdraw application.');
    } finally {
      setWithdrawing(false);
    }
  };

  const openWithdrawModal = (appId) => {
    setSelectedAppId(appId);
    setShowWithdrawModal(true);
  };

  if (loading) {
    return (
      <div className="container py-4">
        <h3 className="fw-bold mb-4">Applied Jobs</h3>
        <div className="placeholder-glow">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="placeholder-glow mb-2">
              <div className="placeholder col-12" style={{ height: 56 }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">Applied Jobs</h3>
        <div className="btn-group btn-group-sm" role="group">
          <button
            type="button"
            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('table')}
          >
            Table
          </button>
          <button
            type="button"
            className={`btn ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('card')}
          >
            Cards
          </button>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {statuses.map((status) => (
          <button
            key={status}
            className={`btn btn-sm ${filterStatus === status ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilterStatus(status)}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {newsApps.length > 0 && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-header bg-white border-bottom d-flex align-items-center gap-2">
            <BsMegaphone className="text-danger" />
            <h6 className="mb-0 fw-bold">Important News</h6>
          </div>
          <div className="card-body py-3">
            {newsApps.map((app) => {
              const item = newsItems(app)[0];
              return (
                <div key={app.id} className="d-flex align-items-start gap-2 py-2 border-bottom border-light">
                  <BsExclamationTriangle className="text-warning mt-1 flex-shrink-0" />
                  <div className="small">
                    <span className="fw-semibold">{app.job?.title || 'Job'}</span>
                    <span className="text-muted"> - {item.title}: </span>
                    <span className="text-muted">{item.body}</span>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0 ms-2 text-primary"
                      onClick={() => setViewApp(app)}
                    >
                      View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredApps.length > 0 ? (
        viewMode === 'table' ? (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Contact</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app) => {
                    const contact = contactInfo(app);
                    return (
                      <tr key={app.id}>
                        <td className="fw-semibold">{app.job?.title || 'N/A'}</td>
                        <td>{app.job?.employer?.company_name || 'N/A'}</td>
                        <td className="text-muted">{new Date(app.applied_at || app.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge rounded-pill ${statusBadge(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="text-muted small">
                          <div><BsPerson className="me-1" />{contact.person}</div>
                          <div><BsTelephone className="me-1" />{contact.phone}</div>
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => setViewApp(app)}
                            title="View Job"
                          >
                            <BsEye />
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => openWithdrawModal(app.id)}
                            title="Withdraw Application"
                          >
                            <BsXCircle />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="row">
            {filteredApps.map((app) => {
              const contact = contactInfo(app);
              const news = newsItems(app);
              return (
                <div key={app.id} className="col-12 col-md-6 col-lg-4 mb-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body d-flex flex-column">
                      <h6 className="card-title fw-bold">{app.job?.title || 'N/A'}</h6>
                      <p className="text-muted small mb-1 d-flex align-items-center gap-1">
                        <BsBuilding /> {app.job?.employer?.company_name || 'N/A'}
                      </p>
                      <p className="text-muted small mb-2">
                        Applied: {new Date(app.applied_at || app.createdAt).toLocaleDateString()}
                      </p>
                      <span className={`badge rounded-pill ${statusBadge(app.status)} mb-2 align-self-start`}>
                        {app.status}
                      </span>
                      <div className="small text-muted mb-3">
                        <div><BsPerson className="me-1" />{contact.person}</div>
                        <div><BsTelephone className="me-1" />{contact.phone}</div>
                      </div>
                      {news.length > 0 && (
                        <div className="d-inline-flex align-items-center gap-1 small fw-semibold mb-3" style={{ color: '#b45309' }}>
                          <BsMegaphone /> {news.length} Important update{news.length > 1 ? 's' : ''}
                        </div>
                      )}
                      <div className="d-flex gap-2 mt-auto">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary flex-fill"
                          onClick={() => setViewApp(app)}
                        >
                          <BsEye className="me-1" /> View Job
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => openWithdrawModal(app.id)}
                        >
                          <BsXCircle />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="text-center py-5">
          <BsBriefcase size={48} className="text-muted mb-3" />
          <h5 className="text-muted">
            {filterStatus === 'all' ? 'No applications yet' : `No ${filterStatus} applications`}
          </h5>
          <p className="text-muted">Start applying to jobs to track your progress.</p>
          <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
        </div>
      )}

      <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Withdraw Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to withdraw this application? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWithdrawModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleWithdraw} disabled={withdrawing}>
            {withdrawing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Withdrawing...
              </>
            ) : (
              'Withdraw'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!viewApp} onHide={() => setViewApp(null)} size="lg" centered>
        {viewApp && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{viewApp.job?.title || 'Job'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className={`badge rounded-pill ${statusBadge(viewApp.status)}`}>{viewApp.status}</span>
                {viewApp.job?.category && (
                  <span className="badge bg-secondary bg-opacity-10 text-secondary">{viewApp.job.category}</span>
                )}
                {viewApp.job?.job_type && (
                  <span className="badge bg-info bg-opacity-10 text-info">
                    <BsClock className="me-1" />{viewApp.job.job_type}
                  </span>
                )}
                {viewApp.job?.location && (
                  <span className="badge bg-secondary bg-opacity-10 text-secondary">
                    <BsGeoAlt className="me-1" />{viewApp.job.location}
                  </span>
                )}
              </div>

              {formatSalary(viewApp.job) && (
                <div className="fw-bold mb-2 text-primary d-inline-flex align-items-center gap-1">
                  <BsCashCoin /> {formatSalary(viewApp.job)}
                </div>
              )}

              <div className="row g-3 mt-1">
                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-light">
                    <div className="card-body py-3">
                      <h6 className="fw-bold mb-3">Contact Information</h6>
                      <div className="small">
                        <div className="mb-2 d-flex align-items-center gap-2">
                          <BsPerson className="text-primary" />
                          <div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>Contact Person</div>
                            <div className="fw-semibold">{contactInfo(viewApp).person}</div>
                          </div>
                        </div>
                        <div className="mb-2 d-flex align-items-center gap-2">
                          <BsTelephone className="text-primary" />
                          <div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>Phone</div>
                            <div className="fw-semibold">{contactInfo(viewApp).phone}</div>
                          </div>
                        </div>
                        {contactInfo(viewApp).email && (
                          <div className="d-flex align-items-center gap-2">
                            <BsPerson className="text-primary" />
                            <div>
                              <div className="text-muted" style={{ fontSize: '0.72rem' }}>Email</div>
                              <div className="fw-semibold">{contactInfo(viewApp).email}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div className="card border-0 bg-light">
                    <div className="card-body py-3">
                      <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                        <BsMegaphone className="text-danger" /> Important News
                      </h6>
                      {newsItems(viewApp).length > 0 ? (
                        <div className="small">
                          {newsItems(viewApp).map((item, i) => (
                            <div key={i} className="mb-3">
                              <div className={`fw-semibold text-${item.color}`}>{item.title}</div>
                              <div className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{item.body}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted small mb-0">No updates yet. Keep an eye here for employer messages and interview invites.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {viewApp.cover_letter && (
                <div className="mt-3">
                  <h6 className="fw-bold">Your Cover Letter</h6>
                  <p className="text-muted small mb-0" style={{ whiteSpace: 'pre-wrap' }}>{viewApp.cover_letter}</p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setViewApp(null)}>Close</Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AppliedJobs;
