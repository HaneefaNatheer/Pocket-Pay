import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { employerService } from '../../services/employerService';
import { jobService } from '../../services/jobService';
import { BsSearch, BsPencil, BsTrash, BsEye, BsPeople, BsPlusLg, BsArrowUpDown, BsCheckCircle, BsXCircle, BsEnvelope, BsBriefcase, BsClock, BsFilter } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ITEMS_PER_PAGE = 8;

const statusBadge = (status) => {
  const map = {
    active: 'bg-success text-white',
    open: 'bg-success text-white',
    closed: 'bg-danger text-white',
    draft: 'bg-secondary text-white',
    pending: 'bg-warning text-dark',
    expired: 'bg-dark text-white',
  };
  return map[status?.toLowerCase()] || 'bg-secondary text-white';
};

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  const normalize = (item) => ({
    ...item,
    _id: item._id || item.id,
    applicationCount: item.applicationCount || item.current_applicants || 0,
  });

  const fetchJobs = async () => {
    try {
      const res = await employerService.getMyJobs();
      const raw = res.data?.data || res.data || [];
      setJobs(raw.map(normalize));
    } catch (err) {
      toast.error('Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];
    if (activeTab !== 'all') {
      result = result.filter((j) => j.status?.toLowerCase() === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((j) =>
        j.title?.toLowerCase().includes(q) || j.category?.toLowerCase().includes(q)
      );
    }
    if (sort === 'newest') result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === 'views') result.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (sort === 'applications') result.sort((a, b) => (b.applicationCount || 0) - (a.applicationCount || 0));
    return result;
  }, [jobs, activeTab, search, sort]);

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const tabs = [
    { key: 'all', label: 'All', count: jobs.length },
    { key: 'active', label: 'Active', count: jobs.filter((j) => j.status?.toLowerCase() === 'active' || j.status?.toLowerCase() === 'open').length },
    { key: 'closed', label: 'Closed', count: jobs.filter((j) => j.status?.toLowerCase() === 'closed').length },
    { key: 'draft', label: 'Draft', count: jobs.filter((j) => j.status?.toLowerCase() === 'draft').length },
  ];

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedJobs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedJobs.map((j) => j._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await jobService.delete(deleteTarget._id);
      toast.success('Job deleted.');
      setJobs((prev) => prev.filter((j) => j._id !== deleteTarget._id));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete job.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseReopen = async (job) => {
    const newStatus = job.status?.toLowerCase() === 'closed' ? 'active' : 'closed';
    try {
      await jobService.update(job._id, { status: newStatus });
      toast.success(`Job ${newStatus === 'closed' ? 'closed' : 'reopened'}.`);
      setJobs((prev) => prev.map((j) => j._id === job._id ? { ...j, status: newStatus } : j));
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update job status.');
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    try {
      if (bulkAction === 'close') {
        for (const id of selectedIds) await jobService.update(id, { status: 'closed' });
        toast.success(`${selectedIds.length} job(s) closed.`);
      } else if (bulkAction === 'reopen') {
        for (const id of selectedIds) await jobService.update(id, { status: 'active' });
        toast.success(`${selectedIds.length} job(s) reopened.`);
      } else if (bulkAction === 'delete') {
        for (const id of selectedIds) await jobService.delete(id);
        toast.success(`${selectedIds.length} job(s) deleted.`);
      }
      setJobs((prev) => prev.filter((j) => !selectedIds.includes(j._id)));
      setSelectedIds([]);
      setBulkAction('');
    } catch (err) {
      toast.error('Bulk action failed.');
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="placeholder-glow mb-4">
          <div className="placeholder col-4 mb-2" style={{ height: 32 }}></div>
          <div className="placeholder col-6" style={{ height: 18 }}></div>
        </div>
        <div className="row g-3">
          {[...Array(4)].map((_, i) => (
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Manage Jobs</h4>
          <small className="text-muted">{jobs.length} total jobs posted</small>
        </div>
        <Link to="/employer/post-job" className="btn btn-primary">
          <BsPlusLg className="me-1" /> Post New Job
        </Link>
      </div>

      <ul className="nav nav-pills mb-4">
        {tabs.map((tab) => (
          <li className="nav-item me-1" key={tab.key}>
            <button
              className={`nav-link ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab.key); setPage(1); setSelectedIds([]); }}
            >
              {tab.label}
              <span className={`badge ms-1 ${activeTab === tab.key ? 'bg-white text-primary' : 'bg-light text-dark'}`}>
                {tab.count}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="input-group" style={{ maxWidth: 360 }}>
          <span className="input-group-text bg-white border-end-0"><BsSearch /></span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="form-select form-select-sm"
          style={{ width: 'auto' }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="views">Most Viewed</option>
          <option value="applications">Most Applications</option>
        </select>
        {selectedIds.length > 0 && (
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Bulk Actions</option>
              <option value="close">Close Selected</option>
              <option value="reopen">Reopen Selected</option>
              <option value="delete">Delete Selected</option>
            </select>
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={handleBulkAction}
              disabled={!bulkAction}
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {paginatedJobs.length > 0 ? (
        <>
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedIds.length === paginatedJobs.length && paginatedJobs.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th className="text-center">Applications</th>
                    <th className="text-center">Views</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedJobs.map((job) => (
                    <tr key={job._id}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedIds.includes(job._id)}
                          onChange={() => toggleSelect(job._id)}
                        />
                      </td>
                      <td className="fw-semibold">{job.title}</td>
                      <td><span className="badge bg-light text-dark">{job.category || 'N/A'}</span></td>
                      <td><span className={`badge rounded-pill ${statusBadge(job.status)}`}>{job.status}</span></td>
                      <td className="text-center">{job.applicationCount || 0}</td>
                      <td className="text-center"><BsEye className="me-1 text-muted" />{job.views || 0}</td>
                      <td className="text-muted small">{new Date(job.createdAt).toLocaleDateString()}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/employer/applicants/${job._id}`)}
                            title="View Applicants"
                          >
                            <BsPeople />
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => handleCloseReopen(job)}
                            title={job.status?.toLowerCase() === 'closed' ? 'Reopen' : 'Close'}
                          >
                            {job.status?.toLowerCase() === 'closed' ? <BsCheckCircle /> : <BsXCircle />}
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => { setDeleteTarget(job); setShowDeleteModal(true); }}
                            title="Delete"
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

          {totalPages > 1 && (
            <nav className="mt-3">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page - 1)}>Previous</button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button className="page-link" onClick={() => setPage(page + 1)}>Next</button>
                </li>
              </ul>
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <BsBriefcase size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No jobs found</h5>
          <p className="text-muted">
            {search ? 'Try adjusting your search.' : 'Start by posting your first job.'}
          </p>
          {!search && (
            <Link to="/employer/post-job" className="btn btn-primary">
              <BsPlusLg className="me-1" /> Post New Job
            </Link>
          )}
        </div>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{deleteTarget?.title}</strong>? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Deleting...
              </>
            ) : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageJobs;
