import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import {
  BsPeople,
  BsBriefcase,
  BsFileEarmarkText,
  BsShieldCheck,
  BsArrowRepeat,
  BsPerson,
  BsBuilding,
  BsClock,
  BsCheckCircle,
  BsXCircle,
  BsHourglassSplit,
  BsExclamationTriangle,
  BsGraphUp,
  BsCalendar,
} from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const SystemLogs = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [logs, setLogs] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const [dashRes, logsRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getLogs(),
      ]);
      setDashboard(dashRes.data?.data || dashRes.data || {});
      setLogs(logsRes.data?.data || logsRes.data || {});
    } catch (err) {
      toast.error('Failed to load system data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 30000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, fetchData]);

  const systemInfo = [
    {
      icon: <BsPeople size={22} color="#0d6efd" />,
      label: 'Total Users',
      value: dashboard?.totalUsers || logs?.totalUsers || 0,
      color: '#0d6efd',
    },
    {
      icon: <BsBriefcase size={22} color="#198754" />,
      label: 'Total Jobs',
      value: dashboard?.totalJobs || logs?.totalJobs || 0,
      color: '#198754',
    },
    {
      icon: <BsFileEarmarkText size={22} color="#6f42c1" />,
      label: 'Total Applications',
      value: dashboard?.totalApplications || logs?.totalApplications || 0,
      color: '#6f42c1',
    },
    {
      icon: <BsShieldCheck size={22} color="#198754" />,
      label: 'Server Status',
      value: 'Online',
      color: '#198754',
    },
  ];

  const recentRegistrations = logs?.recentRegistrations || dashboard?.recentRegistrations || [];
  const recentJobPostings = logs?.recentJobPostings || dashboard?.recentJobPostings || [];
  const recentApplications = logs?.recentApplications || dashboard?.recentApplications || [];
  const usersByRole = logs?.usersByRole || dashboard?.usersByRole || [];
  const jobsByCategory = logs?.jobsByCategory || dashboard?.jobsByCategory || [];
  const applicationStatusBreakdown = logs?.applicationStatusBreakdown || dashboard?.applicationStatusBreakdown || [];

  const roleColors = {
    student: 'primary',
    employer: 'success',
    admin: 'danger',
  };

  const appStatusColors = {
    pending: 'warning',
    accepted: 'success',
    rejected: 'danger',
    interviewed: 'info',
    withdrawn: 'secondary',
    viewed: 'primary',
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="placeholder-glow mb-4">
          <div className="placeholder col-4 mb-2" style={{ height: 32 }}></div>
          <div className="placeholder col-7" style={{ height: 18 }}></div>
        </div>
        <div className="row g-3 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm placeholder-glow" style={{ height: 90 }}>
                <div className="card-body">
                  <div className="placeholder col-4 rounded-circle" style={{ height: 48, width: 48 }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row g-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm" style={{ height: 300 }}>
                <div className="card-body skeleton-block" style={{ background: '#e9ecef', borderRadius: 8, height: '100%' }}></div>
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
          <h4 className="fw-bold mb-0">System Logs</h4>
          <small className="text-muted">Platform overview and recent activity</small>
        </div>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="autoRefreshToggle"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          <label className="form-check-label small fw-semibold" htmlFor="autoRefreshToggle">
            <BsArrowRepeat className={`me-1 ${autoRefresh ? 'spin' : ''}`} />
            Auto-refresh (30s)
          </label>
        </div>
      </div>

      {/* System Info Cards */}
      <div className="row g-4 mb-4">
        {systemInfo.map((info, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex align-items-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                  style={{ width: 52, height: 52, backgroundColor: `${info.color}20` }}
                >
                  {info.icon}
                </div>
                <div className="overflow-hidden">
                  <h5 className="mb-0 fw-bold text-truncate">
                    {info.label === 'Server Status' ? (
                      <span className="d-flex align-items-center">
                        <span
                          className="rounded-circle d-inline-block me-2"
                          style={{ width: 10, height: 10, backgroundColor: '#198754' }}
                        ></span>
                        {info.value}
                      </span>
                    ) : (
                      info.value
                    )}
                  </h5>
                  <small className="text-muted">{info.label}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tables */}
      <div className="row g-4 mb-4">
        {/* Recent Registrations */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold"><BsPerson className="me-2" />Recent Registrations</h6>
              <span className="badge bg-light text-dark">Last 10</span>
            </div>
            <div className="card-body p-0" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {recentRegistrations.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {recentRegistrations.slice(0, 10).map((reg, idx) => (
                    <li key={reg._id || idx} className="list-group-item py-2 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p className="mb-0 small fw-semibold">{reg.name || 'N/A'}</p>
                          <small className="text-muted">{reg.email || 'N/A'}</small>
                        </div>
                        <div className="text-end">
                          <span className={`badge bg-${roleColors[reg.role] || 'secondary'}`}>
                            {reg.role || 'N/A'}
                          </span>
                          <br />
                          <small className="text-muted">
                            {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : ''}
                          </small>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-muted">No registrations.</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Job Postings */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold"><BsBriefcase className="me-2" />Recent Job Postings</h6>
              <span className="badge bg-light text-dark">Last 10</span>
            </div>
            <div className="card-body p-0" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {recentJobPostings.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {recentJobPostings.slice(0, 10).map((job, idx) => (
                    <li key={job._id || idx} className="list-group-item py-2 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1 me-2">
                          <p className="mb-0 small fw-semibold text-truncate">{job.title || 'N/A'}</p>
                          <small className="text-muted text-truncate d-block">
                            {job.employerName || job.companyName || 'N/A'}
                          </small>
                        </div>
                        <div className="text-end flex-shrink-0">
                          <span className="badge bg-info">{job.category || 'N/A'}</span>
                          <br />
                          <small className="text-muted">
                            {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ''}
                          </small>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-muted">No job postings.</div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold"><BsFileEarmarkText className="me-2" />Recent Applications</h6>
              <span className="badge bg-light text-dark">Last 10</span>
            </div>
            <div className="card-body p-0" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {recentApplications.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {recentApplications.slice(0, 10).map((app, idx) => (
                    <li key={app._id || idx} className="list-group-item py-2 px-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1 me-2">
                          <p className="mb-0 small fw-semibold text-truncate">
                            {app.studentName || app.student?.name || 'N/A'}
                          </p>
                          <small className="text-muted text-truncate d-block">
                            {app.jobTitle || app.job?.title || 'N/A'}
                          </small>
                        </div>
                        <div className="text-end flex-shrink-0">
                          <span className={`badge bg-${appStatusColors[app.status] || 'secondary'}`}>
                            {app.status || 'N/A'}
                          </span>
                          <br />
                          <small className="text-muted">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}
                          </small>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-muted">No applications.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Platform Statistics */}
      <div className="row g-4 mb-4">
        {/* Users by Role */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold"><BsPeople className="me-2" />Users by Role</h6>
            </div>
            <div className="card-body">
              {usersByRole.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Role</th>
                        <th className="text-center">Count</th>
                        <th className="text-center">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersByRole.map((item, idx) => {
                        const total = usersByRole.reduce((sum, r) => sum + (r.count || 0), 0);
                        const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                        return (
                          <tr key={idx}>
                            <td>
                              <span className={`badge bg-${roleColors[item.role || item.name] || 'secondary'} me-1`}>
                                {item.role || item.name || 'N/A'}
                              </span>
                            </td>
                            <td className="text-center fw-semibold">{item.count || 0}</td>
                            <td className="text-center">
                              <div className="d-flex align-items-center">
                                <div
                                  className="flex-grow-1 rounded"
                                  style={{
                                    height: 6,
                                    backgroundColor: '#e9ecef',
                                  }}
                                >
                                  <div
                                    className={`rounded bg-${roleColors[item.role || item.name] || 'secondary'}`}
                                    style={{
                                      height: '100%',
                                      width: `${percentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <small className="ms-2 text-muted">{percentage}%</small>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">No data.</div>
              )}
            </div>
          </div>
        </div>

        {/* Jobs by Category */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold"><BsBriefcase className="me-2" />Jobs by Category</h6>
            </div>
            <div className="card-body">
              {jobsByCategory.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Category</th>
                        <th className="text-center">Count</th>
                        <th className="text-center">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobsByCategory.map((item, idx) => {
                        const total = jobsByCategory.reduce((sum, c) => sum + (c.count || 0), 0);
                        const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                        const categoryColors = ['#0d6efd', '#198754', '#6f42c1', '#fd7e14', '#0dcaf0', '#dc3545', '#ffc107'];
                        const color = categoryColors[idx % categoryColors.length];
                        return (
                          <tr key={idx}>
                            <td>
                              <span
                                className="badge me-1"
                                style={{ backgroundColor: color }}
                              >
                                {item.category || item.name || 'N/A'}
                              </span>
                            </td>
                            <td className="text-center fw-semibold">{item.count || 0}</td>
                            <td className="text-center">
                              <div className="d-flex align-items-center">
                                <div
                                  className="flex-grow-1 rounded"
                                  style={{
                                    height: 6,
                                    backgroundColor: '#e9ecef',
                                  }}
                                >
                                  <div
                                    className="rounded"
                                    style={{
                                      height: '100%',
                                      width: `${percentage}%`,
                                      backgroundColor: color,
                                    }}
                                  ></div>
                                </div>
                                <small className="ms-2 text-muted">{percentage}%</small>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">No data.</div>
              )}
            </div>
          </div>
        </div>

        {/* Application Status Breakdown */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold"><BsFileEarmarkText className="me-2" />Application Status</h6>
            </div>
            <div className="card-body">
              {applicationStatusBreakdown.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-bordered mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Status</th>
                        <th className="text-center">Count</th>
                        <th className="text-center">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicationStatusBreakdown.map((item, idx) => {
                        const total = applicationStatusBreakdown.reduce((sum, s) => sum + (s.count || 0), 0);
                        const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                        return (
                          <tr key={idx}>
                            <td>
                              <span className={`badge bg-${appStatusColors[item.status || item.name] || 'secondary'} me-1`}>
                                {item.status || item.name || 'N/A'}
                              </span>
                            </td>
                            <td className="text-center fw-semibold">{item.count || 0}</td>
                            <td className="text-center">
                              <div className="d-flex align-items-center">
                                <div
                                  className="flex-grow-1 rounded"
                                  style={{
                                    height: 6,
                                    backgroundColor: '#e9ecef',
                                  }}
                                >
                                  <div
                                    className={`rounded bg-${appStatusColors[item.status || item.name] || 'secondary'}`}
                                    style={{
                                      height: '100%',
                                      width: `${percentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <small className="ms-2 text-muted">{percentage}%</small>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">No data.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
