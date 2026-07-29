import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import ConfirmModal from '../../components/common/ConfirmModal';
import Pagination from '../../components/common/Pagination';
import Swal from 'sweetalert2';
import {
  BsSearch,
  BsEye,
  BsTrash,
  BsBriefcase,
  BsBuilding,
  BsCalendar,
  BsCurrencyDollar,
  BsGeoAlt,
  BsClock,
  BsPeople,
  BsEyeFill,
  BsListCheck,
  BsTag,
} from 'react-icons/bs';
import { toast } from 'react-toastify';
import { Modal, Button, Badge, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ITEMS_PER_PAGE = 10;

const statusColors = {
  active: 'success',
  closed: 'secondary',
  expired: 'warning',
  draft: 'info',
  deleted: 'danger',
};

const ManageJobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [statusUpdating, setStatusUpdating] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE, search };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;
      const res = await adminService.getJobs(params);
      const data = res.data?.data || res.data || {};
      const jobList = Array.isArray(data) ? data : data.jobs || data.results || [];
      setJobs(jobList);
      setTotalPages(data.totalPages || data.pages || Math.ceil((data.total || 0) / ITEMS_PER_PAGE) || 1);
      const cats = data.categories || [];
      if (cats.length > 0) setCategories(cats);
    } catch (err) {
      toast.error('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    let result = [...jobs];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.employerName?.toLowerCase().includes(q) ||
          j.companyName?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [jobs, search]);

  const handleViewDetails = async (job) => {
    setShowDetailsModal(true);
    setLoadingDetails(true);
    try {
      const res = await adminService.getJobs({ id: job._id });
      const data = res.data?.data || res.data || job;
      setSelectedJob(data);
    } catch {
      setSelectedJob(job);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRemoveJob = (job) => {
    Swal.fire({
      title: 'Remove Job?',
      html: `Are you sure you want to remove <strong>"${job.title}"</strong>?<br/><small class="text-muted">This action cannot be undone.</small>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, remove it',
      cancelButtonText: 'Cancel',
      customClass: { popup: 'swal2-popup-custom' },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await adminService.removeJob(job._id);
          toast.success('Job removed successfully.');
          setJobs((prev) => prev.filter((j) => j._id !== job._id));
          Swal.fire('Removed!', 'The job has been removed.', 'success');
        } catch (err) {
          toast.error(err?.response?.data?.message || 'Failed to remove job.');
        }
      }
    });
  };

  const handleStatusChange = async (job, newStatus) => {
    setStatusUpdating(job._id);
    try {
      await adminService.getJobs({ id: job._id, status: newStatus });
      toast.success(`Job status updated to "${newStatus}".`);
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, status: newStatus } : j))
      );
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setStatusUpdating(null);
    }
  };

  if (loading && jobs.length === 0) {
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
                  <div className="placeholder flex-grow-1" style={{ height: 16 }}></div>
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
          <h4 className="fw-bold mb-0">Manage Jobs</h4>
          <small className="text-muted">{jobs.length} total jobs</small>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text bg-white border-end-0">
            <BsSearch />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search by job title, employer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id || cat} value={cat._id || cat}>
              {cat.name || cat}
            </option>
          ))}
        </select>
      </div>

      <ul className="nav nav-tabs mb-3">
        {['all', 'active', 'closed', 'expired', 'draft'].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${statusFilter === tab ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          </li>
        ))}
      </ul>

      {filteredJobs.length > 0 ? (
        <>
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Job Title</th>
                    <th>Employer</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th className="text-center">Applications</th>
                    <th className="text-center">Views</th>
                    <th>Posted</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job._id}>
                      <td className="fw-semibold">{job.title || 'N/A'}</td>
                      <td>{job.employerName || job.companyName || job.employer?.companyName || 'N/A'}</td>
                      <td>
                        <Badge bg="info" pill>{job.category || 'N/A'}</Badge>
                      </td>
                      <td>
                        <Badge bg={statusColors[job.status] || 'secondary'}>
                          {job.status || 'N/A'}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <BsPeople className="text-muted me-1" />
                        {job.applicationsCount || job.applicationCount || 0}
                      </td>
                      <td className="text-center">
                        <BsEyeFill className="text-muted me-1" />
                        {job.viewsCount || job.views || 0}
                      </td>
                      <td className="text-muted small">
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            title="View Details"
                            onClick={() => handleViewDetails(job)}
                          >
                            <BsEye />
                          </button>
                          <div className="dropdown">
                            <button
                              className="btn btn-outline-secondary dropdown-toggle dropdown-toggle-split"
                              data-bs-toggle="dropdown"
                              title="Change Status"
                              disabled={statusUpdating === job._id}
                            >
                              {statusUpdating === job._id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <BsListCheck />
                              )}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                              {['active', 'closed', 'expired', 'draft'].map((s) => (
                                <li key={s}>
                                  <button
                                    className={`dropdown-item ${job.status === s ? 'active' : ''}`}
                                    onClick={() => handleStatusChange(job, s)}
                                    disabled={job.status === s}
                                  >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button
                            className="btn btn-outline-danger"
                            title="Remove Job"
                            onClick={() => handleRemoveJob(job)}
                          >
                            <BsTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      ) : (
        <div className="text-center py-5">
          <BsBriefcase size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No jobs found</h5>
          <p className="text-muted">
            {search ? 'Try adjusting your search.' : 'No jobs posted yet.'}
          </p>
        </div>
      )}

      {/* Job Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetails ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : selectedJob ? (
            <div className="row g-4">
              <div className="col-12">
                <div className="d-flex flex-wrap justify-content-between align-items-start">
                  <div>
                    <h5 className="fw-bold mb-1">{selectedJob.title}</h5>
                    <p className="text-muted mb-0">
                      {selectedJob.employerName || selectedJob.companyName || selectedJob.employer?.companyName || 'N/A'}
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <Badge bg={statusColors[selectedJob.status] || 'secondary'}>
                      {selectedJob.status || 'N/A'}
                    </Badge>
                    <Badge bg="info" pill>{selectedJob.category || 'N/A'}</Badge>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="card border h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Job Info</h6>
                    <p className="mb-2 small"><BsGeoAlt className="me-2 text-muted" />{selectedJob.location || 'N/A'}</p>
                    <p className="mb-2 small"><BsCurrencyDollar className="me-2 text-muted" />{selectedJob.salary || selectedJob.salaryRange || 'N/A'}</p>
                    <p className="mb-2 small"><BsClock className="me-2 text-muted" />{selectedJob.schedule || selectedJob.type || 'N/A'}</p>
                    <p className="mb-0 small"><BsCalendar className="me-2 text-muted" />
                      Deadline: {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="card border h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Stats</h6>
                    <p className="mb-2 small"><BsPeople className="me-2 text-muted" />Applications: {selectedJob.applicationsCount || selectedJob.applicationCount || 0}</p>
                    <p className="mb-2 small"><BsEyeFill className="me-2 text-muted" />Views: {selectedJob.viewsCount || selectedJob.views || 0}</p>
                    <p className="mb-0 small"><BsCalendar className="me-2 text-muted" />Posted: {selectedJob.createdAt ? new Date(selectedJob.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Description</h6>
                    <p className="small text-muted mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedJob.description || 'No description provided.'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedJob.requirements?.length > 0 && (
                <div className="col-12">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="fw-semibold mb-3">Requirements</h6>
                      <ul className="mb-0">
                        {selectedJob.requirements.map((req, idx) => (
                          <li key={idx} className="small text-muted">{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {selectedJob.skills?.length > 0 && (
                <div className="col-12">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="fw-semibold mb-3"><BsTag className="me-2" />Skills</h6>
                      <div className="d-flex flex-wrap gap-1">
                        {selectedJob.skills.map((skill, idx) => (
                          <span key={idx} className="badge bg-light text-dark">
                            {typeof skill === 'string' ? skill : skill.name || skill.skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-12">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Employer Info</h6>
                    <p className="mb-1 small"><strong>Company:</strong> {selectedJob.employerName || selectedJob.companyName || selectedJob.employer?.companyName || 'N/A'}</p>
                    <p className="mb-0 small"><strong>Email:</strong> {selectedJob.employerEmail || selectedJob.employer?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">No job data.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageJobs;
