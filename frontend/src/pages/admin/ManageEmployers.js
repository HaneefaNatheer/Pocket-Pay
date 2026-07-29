import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import {
  BsSearch,
  BsEye,
  BsShieldCheck,
  BsShieldSlash,
  BsShieldLock,
  BsBriefcase,
  BsBuilding,
  BsChevronLeft,
  BsChevronRight,
  BsGlobe,
  BsEnvelope,
  BsPhone,
  BsGeoAlt,
  BsCalendar,
  BsPerson,
  BsPeople,
  BsCheckCircle,
  BsXCircle,
  BsBoxArrowUpRight,
  BsTrash,
  BsDownload,
} from 'react-icons/bs';
import { toast } from 'react-toastify';
import { Modal, Button, Badge } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ITEMS_PER_PAGE = 10;

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
};

const ManageEmployers = () => {
  const { user } = useAuth();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileEmployer, setProfileEmployer] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmVariant, setConfirmVariant] = useState('primary');
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const normalizeEmployer = (e) => ({
    id: e.id,
    user_id: e.user_id,
    company_name: e.company_name || e.companyName || 'N/A',
    company_logo: e.company_logo || e.companyLogo || e.logo,
    contact_name: e.contact_name || e.contactName || e.user?.name || 'N/A',
    name: e.user?.name || e.name || 'Unknown',
    email: e.user?.email || e.email || '',
    is_active: e.user?.is_active !== false,
    blocked: e.user?.is_active === false,
    is_verified: e.is_verified === true,
    phone: e.user?.phone || e.phone,
    address: e.address,
    website: e.website,
    industry: e.industry,
    company_size: e.company_size || e.companySize || e.size,
    description: e.description,
    jobs_posted: e.total_jobs_posted || e.jobsPosted || e.jobCount || 0,
    createdAt: e.createdAt,
    jobs: e.jobs || e.postedJobs || [],
  });

  useEffect(() => {
    fetchEmployers();
  }, [page, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE, search };
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await adminService.getEmployers(params);
      const data = res.data?.data || res.data || {};
      const raw = Array.isArray(data) ? data : data.employers || data.results || [];
      setEmployers(raw.map(normalizeEmployer));
      setTotalPages(data.totalPages || data.pages || Math.ceil((data.total || 0) / ITEMS_PER_PAGE) || 1);
    } catch (err) {
      toast.error('Failed to load employers.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployers = useMemo(() => {
    if (statusFilter !== 'all') return employers;
    return employers;
  }, [employers, statusFilter]);

  const handleViewProfile = async (employer) => {
    setShowProfileModal(true);
    setLoadingProfile(true);
    try {
      const res = await adminService.getEmployers({ id: employer.id });
      const data = res.data?.data || res.data || employer;
      setProfileEmployer(normalizeEmployer(Array.isArray(data) ? data[0] : data));
    } catch {
      setProfileEmployer(employer);
    } finally {
      setLoadingProfile(false);
    }
  };

  const openVerifyConfirm = (employer) => {
    const isVerified = employer.is_verified;
    setConfirmTitle(isVerified ? 'Unverify Employer' : 'Verify Employer');
    setConfirmMessage(
      isVerified
        ? `Are you sure you want to unverify "${employer.company_name}"?`
        : `Are you sure you want to verify "${employer.company_name}"?`
    );
    setConfirmVariant(isVerified ? 'warning' : 'success');
    setConfirmAction(() => async () => {
      setConfirmLoading(true);
      try {
        await adminService.verifyEmployer(employer.id);
        toast.success(`Employer ${isVerified ? 'unverified' : 'verified'} successfully.`);
        setEmployers((prev) =>
          prev.map((e) =>
            e.id === employer.id
              ? { ...e, is_verified: !isVerified }
              : e
          )
        );
        if (profileEmployer?.id === employer.id) {
          setProfileEmployer((prev) => prev ? { ...prev, is_verified: !isVerified } : prev);
        }
        setShowConfirmModal(false);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Action failed.');
      } finally {
        setConfirmLoading(false);
      }
    });
    setShowConfirmModal(true);
  };

  const openBlockConfirm = (employer) => {
    const isBlocked = employer.blocked;
    setConfirmTitle(isBlocked ? 'Unblock Employer' : 'Block Employer');
    setConfirmMessage(
      isBlocked
        ? `Are you sure you want to unblock "${employer.company_name}"?`
        : `Are you sure you want to block "${employer.company_name}"? They will no longer be able to access the platform.`
    );
    setConfirmVariant(isBlocked ? 'success' : 'danger');
    setConfirmAction(() => async () => {
      setConfirmLoading(true);
      try {
        if (isBlocked) {
          await adminService.unblockUser(employer.user_id);
        } else {
          await adminService.blockUser(employer.user_id);
        }
        toast.success(`Employer ${isBlocked ? 'unblocked' : 'blocked'} successfully.`);
        setEmployers((prev) =>
          prev.map((e) =>
            e.id === employer.id ? { ...e, blocked: !isBlocked, is_active: isBlocked } : e
          )
        );
        if (profileEmployer?.id === employer.id) {
          setProfileEmployer((prev) => prev ? { ...prev, blocked: !isBlocked, is_active: isBlocked } : prev);
        }
        setShowConfirmModal(false);
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Action failed.');
      } finally {
        setConfirmLoading(false);
      }
    });
    setShowConfirmModal(true);
  };

  const openDeleteConfirm = (employer) => {
    setDeleteTarget(employer);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminService.deleteEmployer(deleteTarget.id);
      toast.success(`${deleteTarget.company_name} has been deleted.`);
      setEmployers((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete employer.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await adminService.exportData('employers');
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employers.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Employers CSV downloaded.');
    } catch (err) {
      toast.error('Failed to export employers.');
    }
  };

  if (loading && employers.length === 0) {
    return (
      <div className="container py-4">
        <div className="placeholder-glow mb-4">
          <div className="placeholder col-4 mb-2" style={{ height: 32 }}></div>
          <div className="placeholder col-7" style={{ height: 18 }}></div>
        </div>
        <div className="row g-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="col-12">
              <div className="card border-0 shadow-sm placeholder-glow" style={{ height: 64 }}>
                <div className="card-body d-flex align-items-center">
                  <div className="placeholder col-2 rounded-circle" style={{ height: 40, width: 40 }}></div>
                  <div className="ms-3 flex-grow-1">
                    <div className="placeholder col-3 mb-2" style={{ height: 16 }}></div>
                    <div className="placeholder col-5" style={{ height: 14 }}></div>
                  </div>
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
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Manage Employers</h4>
          <small className="text-muted">{employers.length} total employers</small>
        </div>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleExport}>
          <BsDownload className="me-1" /> Export
        </button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text bg-white border-end-0">
            <BsSearch />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search by company name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
      </div>

      {filteredEmployers.length > 0 ? (
        <>
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Company</th>
                    <th>Contact Name</th>
                    <th>Email</th>
                    <th className="text-center">Verified</th>
                    <th className="text-center">Jobs</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployers.map((employer) => {
                    const isVerified = employer.is_verified;
                    return (
                      <tr key={employer.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            {employer.company_logo ? (
                              <img
                                src={`http://localhost:5000/${employer.company_logo}`}
                                alt={employer.company_name}
                                className="rounded me-2"
                                style={{ width: 36, height: 36, objectFit: 'cover' }}
                              />
                            ) : (
                              <div
                                className="rounded d-flex align-items-center justify-content-center me-2 fw-bold text-white small"
                                style={{ width: 36, height: 36, backgroundColor: '#198754', fontSize: 13 }}
                              >
                                {getInitials(employer.company_name)}
                              </div>
                            )}
                            <span className="fw-semibold">{employer.company_name}</span>
                          </div>
                        </td>
                        <td>{employer.contact_name || employer.name || 'N/A'}</td>
                        <td className="text-muted small">{employer.email}</td>
                        <td className="text-center">
                          {isVerified ? (
                            <BsCheckCircle size={18} className="text-success" />
                          ) : (
                            <BsXCircle size={18} className="text-muted" />
                          )}
                        </td>
                        <td className="text-center">
                          <Badge bg="primary" pill>{employer.jobs_posted}</Badge>
                        </td>
                        <td>
                          <span className={employer.blocked ? 'badge bg-danger' : 'badge bg-success'}>
                            {employer.blocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="text-muted small">
                          {employer.createdAt ? new Date(employer.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              title="View Profile"
                              onClick={() => handleViewProfile(employer)}
                            >
                              <BsEye />
                            </button>
                            <button
                              className={`btn ${isVerified ? 'btn-outline-warning' : 'btn-outline-success'}`}
                              title={isVerified ? 'Unverify' : 'Verify'}
                              onClick={() => openVerifyConfirm(employer)}
                              disabled={actionLoading === employer.id}
                            >
                              {isVerified ? <BsShieldSlash /> : <BsShieldCheck />}
                            </button>
                            <button
                              className={`btn ${employer.blocked ? 'btn-outline-success' : 'btn-outline-danger'}`}
                              title={employer.blocked ? 'Unblock' : 'Block'}
                              onClick={() => openBlockConfirm(employer)}
                              disabled={actionLoading === employer.id}
                            >
                              {employer.blocked ? <BsShieldCheck /> : <BsShieldLock />}
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              title="Delete Employer"
                              onClick={() => openDeleteConfirm(employer)}
                            >
                              <BsTrash />
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

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <div className="text-center py-5">
          <BsBuilding size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No employers found</h5>
          <p className="text-muted">
            {search ? 'Try adjusting your search.' : 'No employers registered yet.'}
          </p>
        </div>
      )}

      {/* View Company Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Company Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingProfile ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : profileEmployer ? (
            <div className="row g-4">
              <div className="col-12 text-center">
                {profileEmployer.companyLogo || profileEmployer.logo ? (
                  <img
                    src={profileEmployer.companyLogo || profileEmployer.logo}
                    alt={profileEmployer.companyName || profileEmployer.name}
                    className="rounded mb-3"
                    style={{ width: 80, height: 80, objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded d-inline-flex align-items-center justify-content-center mb-3 fw-bold text-white"
                    style={{ width: 80, height: 80, backgroundColor: '#198754', fontSize: 28 }}
                  >
                    {getInitials(profileEmployer.companyName || profileEmployer.name)}
                  </div>
                )}
                <h5 className="fw-bold mb-1">{profileEmployer.companyName || profileEmployer.name}</h5>
                <div className="d-flex justify-content-center gap-2">
                  <span className={profileEmployer.blocked ? 'badge bg-danger' : 'badge bg-success'}>
                    {profileEmployer.blocked ? 'Blocked' : 'Active'}
                  </span>
                  {(profileEmployer.verified || profileEmployer.isVerified) ? (
                    <span className="badge bg-info"><BsShieldCheck className="me-1" />Verified</span>
                  ) : (
                    <span className="badge bg-secondary">Unverified</span>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="card border h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Company Info</h6>
                    <p className="mb-2 small">
                      <BsPerson className="me-2 text-muted" />
                      {profileEmployer.contactName || profileEmployer.name || 'N/A'}
                    </p>
                    <p className="mb-2 small">
                      <BsEnvelope className="me-2 text-muted" />
                      {profileEmployer.email}
                    </p>
                    <p className="mb-2 small">
                      <BsPhone className="me-2 text-muted" />
                      {profileEmployer.phone || 'N/A'}
                    </p>
                    <p className="mb-2 small">
                      <BsGeoAlt className="me-2 text-muted" />
                      {profileEmployer.address || 'N/A'}
                    </p>
                    <p className="mb-2 small">
                      <BsGlobe className="me-2 text-muted" />
                      {profileEmployer.website ? (
                        <a href={profileEmployer.website} target="_blank" rel="noopener noreferrer">
                          {profileEmployer.website} <BsBoxArrowUpRight size={10} />
                        </a>
                      ) : 'N/A'}
                    </p>
                    <p className="mb-0 small">
                      <BsCalendar className="me-2 text-muted" />
                      Joined {profileEmployer.createdAt ? new Date(profileEmployer.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="card border h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Details</h6>
                    <p className="mb-2 small">
                      <strong>Industry:</strong> {profileEmployer.industry || 'N/A'}
                    </p>
                    <p className="mb-2 small">
                      <strong>Company Size:</strong> {profileEmployer.companySize || profileEmployer.size || 'N/A'}
                    </p>
                    <p className="mb-0 small">
                      <strong>Description:</strong>
                    </p>
                    <p className="small text-muted mb-0">
                      {profileEmployer.description || 'No description provided.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Posted Jobs</h6>
                    {profileEmployer.jobs?.length > 0 || profileEmployer.postedJobs?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Title</th>
                              <th>Category</th>
                              <th>Status</th>
                              <th>Posted</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(profileEmployer.jobs || profileEmployer.postedJobs || []).map((job, idx) => (
                              <tr key={job._id || idx}>
                                <td className="fw-semibold">{job.title || 'N/A'}</td>
                                <td>{job.category || 'N/A'}</td>
                                <td>
                                  <span className={`badge ${job.status === 'active' ? 'bg-success' : job.status === 'closed' ? 'bg-secondary' : 'bg-warning'}`}>
                                    {job.status || 'N/A'}
                                  </span>
                                </td>
                                <td className="text-muted small">
                                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted mb-0">No jobs posted yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">No profile data.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfileModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => { setShowConfirmModal(false); setConfirmAction(null); }}
        onConfirm={confirmAction}
        title={confirmTitle}
        message={confirmMessage}
        variant={confirmVariant}
        loading={confirmLoading}
        confirmText="Confirm"
      />

      <ConfirmModal
        show={showDeleteModal}
        onHide={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
        onConfirm={handleDelete}
        title="Delete Employer"
        message={`Are you sure you want to permanently delete "${deleteTarget?.company_name}"? This will also remove their user account, jobs, and all associated data.`}
        variant="danger"
        loading={deleteLoading}
        confirmText="Delete"
      />
    </div>
  );
};

export default ManageEmployers;
