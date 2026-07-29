import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import Pagination from '../../components/common/Pagination';
import {
  BsSearch,
  BsEye,
  BsExclamationTriangle,
  BsPeople,
  BsFileEarmarkText,
  BsFlag,
  BsPersonExclamation,
  BsBriefcase,
  BsChatLeftText,
  BsClock,
  BsDownload,
  BsCalendarDay,
  BsCalendarMonth,
  BsCalendar,
} from 'react-icons/bs';
import { toast } from 'react-toastify';
import { Modal, Button, Badge, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ITEMS_PER_PAGE = 10;

const typeColors = {
  fake_job: 'danger',
  scam: 'danger',
  inappropriate: 'warning',
  harassment: 'purple',
  other: 'secondary',
};

const typeLabels = {
  fake_job: 'Fake Job',
  scam: 'Scam',
  inappropriate: 'Inappropriate',
  harassment: 'Harassment',
  other: 'Other',
};

const statusColors = {
  pending: 'warning',
  investigating: 'info',
  resolved: 'success',
  dismissed: 'secondary',
};

const ManageReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [counts, setCounts] = useState({ all: 0, pending: 0, investigating: 0, resolved: 0, dismissed: 0 });

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const [adminNotes, setAdminNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE };
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await adminService.getReports(params);
      const data = res.data?.data || res.data || {};
      const reportList = Array.isArray(data) ? data : data.reports || data.results || [];
      setReports(reportList);
      setTotalPages(data.totalPages || data.pages || Math.ceil((data.total || 0) / ITEMS_PER_PAGE) || 1);
      if (data.counts) {
        setCounts(data.counts);
      } else {
        setCounts((prev) => ({
          ...prev,
          all: data.total || reportList.length || 0,
        }));
      }
    } catch (err) {
      toast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (report) => {
    setShowReportModal(true);
    setLoadingReport(true);
    try {
      const res = await adminService.getReports({ id: report._id });
      const data = res.data?.data || res.data || report;
      setSelectedReport(data);
      setAdminNotes(data.adminNotes || data.adminNotes === 0 ? data.adminNotes : '');
    } catch {
      setSelectedReport(report);
      setAdminNotes(report.adminNotes || '');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    setUpdatingStatus(true);
    try {
      await adminService.updateReport(reportId, { status: newStatus });
      toast.success(`Report status updated to "${newStatus}".`);
      setReports((prev) =>
        prev.map((r) => (r._id === reportId ? { ...r, status: newStatus } : r))
      );
      if (selectedReport?._id === reportId) {
        setSelectedReport((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSaveNotes = async (reportId) => {
    setUpdatingStatus(true);
    try {
      await adminService.updateReport(reportId, { adminNotes });
      toast.success('Admin notes saved.');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save notes.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const truncate = (str, len = 80) => {
    if (!str) return 'N/A';
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  const handleDownloadReport = async (type) => {
    const labels = { 'report-daily': 'Daily', 'report-monthly': 'Monthly', 'report-yearly': 'Yearly' };
    try {
      const res = await adminService.exportData(type);
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`${labels[type] || type} report downloaded.`);
    } catch (err) {
      toast.error(`Failed to download ${labels[type] || type} report.`);
    }
  };

  if (loading && reports.length === 0) {
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
          <h4 className="fw-bold mb-0">Manage Reports</h4>
          <small className="text-muted">{counts.all || reports.length} total reports</small>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center justify-content-between">
            <div>
              <h6 className="fw-bold mb-1"><BsDownload className="me-2" />Generated Reports</h6>
              <small className="text-muted">Download system analytics by time period</small>
            </div>
            <div className="d-flex gap-2 mt-2 mt-sm-0">
              <button className="btn btn-outline-primary btn-sm" onClick={() => handleDownloadReport('report-daily')}>
                <BsCalendarDay className="me-1" /> Daily Report
              </button>
              <button className="btn btn-outline-primary btn-sm" onClick={() => handleDownloadReport('report-monthly')}>
                <BsCalendarMonth className="me-1" /> Monthly Report
              </button>
              <button className="btn btn-outline-primary btn-sm" onClick={() => handleDownloadReport('report-yearly')}>
                <BsCalendar className="me-1" /> Yearly Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        {['all', 'pending', 'investigating', 'resolved', 'dismissed'].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${statusFilter === tab ? 'active' : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {counts[tab] !== undefined && (
                <span className="badge bg-secondary ms-1">{counts[tab]}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {reports.length > 0 ? (
        <>
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Reporter</th>
                    <th>Reported User</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <BsPersonExclamation className="text-muted me-2" />
                          <span className="fw-semibold small">
                            {report.reporterName || report.reporter?.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="small">
                        {report.reportedUserName || report.reportedUser?.name || report.reportedUser?.companyName || 'N/A'}
                      </td>
                      <td>
                        <Badge bg={typeColors[report.type] || 'secondary'}>
                          {typeLabels[report.type] || report.type || 'N/A'}
                        </Badge>
                      </td>
                      <td className="small text-muted">
                        {truncate(report.description)}
                      </td>
                      <td>
                        <Badge bg={statusColors[report.status] || 'secondary'}>
                          {report.status || 'N/A'}
                        </Badge>
                      </td>
                      <td className="text-muted small">
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            title="View Full Report"
                            onClick={() => handleViewReport(report)}
                          >
                            <BsEye />
                          </button>
                          <select
                            className="form-select form-select-sm"
                            style={{ width: 'auto', fontSize: 12 }}
                            value={report.status || 'pending'}
                            onChange={(e) => handleStatusUpdate(report._id, e.target.value)}
                            disabled={updatingStatus}
                          >
                            {['pending', 'investigating', 'resolved', 'dismissed'].map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
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
          <BsFlag size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No reports found</h5>
          <p className="text-muted">
            {statusFilter !== 'all' ? 'No reports with this status.' : 'No reports submitted yet.'}
          </p>
        </div>
      )}

      {/* View Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Report Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingReport ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : selectedReport ? (
            <div className="row g-4">
              <div className="col-12">
                <div className="d-flex flex-wrap justify-content-between align-items-start">
                  <h6 className="fw-bold mb-0">Report #{selectedReport._id?.slice(-6) || 'N/A'}</h6>
                  <div className="d-flex gap-2">
                    <Badge bg={typeColors[selectedReport.type] || 'secondary'}>
                      {typeLabels[selectedReport.type] || selectedReport.type || 'N/A'}
                    </Badge>
                    <Badge bg={statusColors[selectedReport.status] || 'secondary'}>
                      {selectedReport.status || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="card border h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Reporter Info</h6>
                    <p className="mb-2 small"><BsPeople className="me-2 text-muted" />
                      <strong>Name:</strong> {selectedReport.reporterName || selectedReport.reporter?.name || 'N/A'}
                    </p>
                    <p className="mb-0 small"><BsFileEarmarkText className="me-2 text-muted" />
                      <strong>Email:</strong> {selectedReport.reporterEmail || selectedReport.reporter?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <div className="card border h-100">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Reported User</h6>
                    <p className="mb-2 small"><BsPersonExclamation className="me-2 text-muted" />
                      <strong>Name:</strong> {selectedReport.reportedUserName || selectedReport.reportedUser?.name || selectedReport.reportedUser?.companyName || 'N/A'}
                    </p>
                    <p className="mb-0 small"><BsFileEarmarkText className="me-2 text-muted" />
                      <strong>Email:</strong> {selectedReport.reportedUserEmail || selectedReport.reportedUser?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {selectedReport.linkedJob && (
                <div className="col-12">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="fw-semibold mb-3"><BsBriefcase className="me-2" />Linked Job</h6>
                      <p className="mb-1 small"><strong>Title:</strong> {selectedReport.linkedJob.title || 'N/A'}</p>
                      <p className="mb-0 small"><strong>Employer:</strong> {selectedReport.linkedJob.employerName || selectedReport.linkedJob.companyName || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="col-12">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Description</h6>
                    <p className="small text-muted mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedReport.description || 'No description provided.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3"><BsClock className="me-2" />Status History</h6>
                    {selectedReport.statusHistory?.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table table-sm table-bordered mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Status</th>
                              <th>Updated By</th>
                              <th>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReport.statusHistory.map((entry, idx) => (
                              <tr key={idx}>
                                <td>
                                  <Badge bg={statusColors[entry.status] || 'secondary'}>
                                    {entry.status || 'N/A'}
                                  </Badge>
                                </td>
                                <td className="small">{entry.updatedBy || 'System'}</td>
                                <td className="text-muted small">
                                  {entry.date || entry.createdAt ? new Date(entry.date || entry.createdAt).toLocaleString() : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">No status history available.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3"><BsChatLeftText className="me-2" />Admin Notes</h6>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Add notes about this report..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                    />
                    <div className="mt-2 text-end">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSaveNotes(selectedReport._id)}
                        disabled={updatingStatus}
                      >
                        {updatingStatus ? (
                          <span className="spinner-border spinner-border-sm me-1"></span>
                        ) : null}
                        Save Notes
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card border">
                  <div className="card-body">
                    <h6 className="fw-semibold mb-3">Update Status</h6>
                    <div className="d-flex flex-wrap gap-2">
                      {['pending', 'investigating', 'resolved', 'dismissed'].map((s) => (
                        <button
                          key={s}
                          className={`btn btn-sm ${selectedReport.status === s ? `btn-${statusColors[s]}` : `btn-outline-${statusColors[s]}`}`}
                          onClick={() => handleStatusUpdate(selectedReport._id, s)}
                          disabled={updatingStatus || selectedReport.status === s}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">No report data.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageReports;
