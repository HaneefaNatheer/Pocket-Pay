import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../../services/applicationService';
import { BsEye, BsXCircle, BsBriefcase, BsSortDown } from 'react-icons/bs';
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

const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [viewMode, setViewMode] = useState('table');

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
        <div className="d-flex gap-2">
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
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app) => (
                    <tr key={app._id}>
                      <td className="fw-semibold">{app.job?.title || 'N/A'}</td>
                      <td>{app.job?.company?.name || 'N/A'}</td>
                      <td className="text-muted">{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge rounded-pill ${statusBadge(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <Link to={`/jobs/${app.job?._id}`} className="btn btn-sm btn-outline-primary me-1">
                          <BsEye />
                        </Link>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => openWithdrawModal(app._id)}
                        >
                          <BsXCircle />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="row">
            {filteredApps.map((app) => (
              <div key={app._id} className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="card-title fw-bold">{app.job?.title || 'N/A'}</h6>
                    <p className="text-muted small mb-1">{app.job?.company?.name || 'N/A'}</p>
                    <p className="text-muted small mb-2">
                      Applied: {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                    <span className={`badge rounded-pill ${statusBadge(app.status)} mb-3`}>
                      {app.status}
                    </span>
                    <div className="d-flex gap-2">
                      <Link to={`/jobs/${app.job?._id}`} className="btn btn-sm btn-outline-primary flex-fill">
                        <BsEye className="me-1" /> View Job
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => openWithdrawModal(app._id)}
                      >
                        <BsXCircle />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-5">
          <BsBriefcase size={48} className="text-muted mb-3" />
          <h5 className="text-muted">
            {filterStatus === 'all' ? 'No applications yet' : `No ${filterStatus} applications`}
          </h5>
          <p className="text-muted">Start applying to jobs to track your progress.</p>
          <Link to="/student/jobs" className="btn btn-primary">Browse Jobs</Link>
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
    </div>
  );
};

export default AppliedJobs;
