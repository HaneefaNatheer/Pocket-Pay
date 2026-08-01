import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import {
  BsPeople,
  BsBuilding,
  BsBriefcase,
  BsFileEarmarkText,
  BsPersonCheck,
  BsGraphUp,
  BsChevronRight,
  BsLightning,
  BsEye,
  BsStar,
} from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const StatsCard = ({ icon, label, value, color, to }) => {
  const content = (
    <div className="card border-0 shadow-sm h-100" style={to ? { cursor: 'pointer' } : undefined}>
      <div className="card-body d-flex align-items-center">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
          style={{ width: 52, height: 52, backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <div className="overflow-hidden">
          <h5 className="mb-0 fw-bold text-truncate">{value}</h5>
          <small className="text-muted">{label}</small>
        </div>
        {to && (
          <BsChevronRight size={12} className="text-muted ms-auto flex-shrink-0" />
        )}
      </div>
    </div>
  );

  if (!to) {
    return <div className="col-12 col-sm-6 col-xl-2 mb-4">{content}</div>;
  }

  return (
    <div className="col-12 col-sm-6 col-xl-2 mb-4">
      <Link to={to} className="text-decoration-none d-block" title={label}>
        {content}
      </Link>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, dashboardRes] = await Promise.all([
          adminService.getAnalytics(),
          adminService.getDashboard(),
        ]);
        setAnalytics(analyticsRes.data?.data || analyticsRes.data || {});
        setDashboard(dashboardRes.data?.data || dashboardRes.data || {});
      } catch (err) {
        setError('Failed to load dashboard data.');
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!analytics) return [];
    return [
      { icon: <BsPeople size={22} color="#0d6efd" />, label: 'Total Students', value: analytics.totalStudents || 0, color: '#0d6efd', to: '/admin/students' },
      { icon: <BsBuilding size={22} color="#198754" />, label: 'Total Employers', value: analytics.totalEmployers || 0, color: '#198754', to: '/admin/employers' },
      { icon: <BsBriefcase size={22} color="#6f42c1" />, label: 'Total Jobs', value: analytics.totalJobs || 0, color: '#6f42c1', to: '/admin/jobs' },
      { icon: <BsFileEarmarkText size={22} color="#fd7e14" />, label: 'Total Applications', value: analytics.totalApplications || 0, color: '#fd7e14', to: '/admin/jobs' },
      { icon: <BsPersonCheck size={22} color="#0dcaf0" />, label: 'Active Users (30d)', value: analytics.activeUsers || 0, color: '#0dcaf0', to: '/admin/logs' },
      { icon: <BsGraphUp size={22} color="#dc3545" />, label: 'Monthly Growth', value: `${analytics.monthlyGrowth || 0}%`, color: '#dc3545', to: '/admin/logs' },
    ];
  }, [analytics]);

  const monthlyData = useMemo(() => {
    const months = analytics?.monthlyRegistrations || [];
    const labels = months.map((m) => m.month || m.label || '');
    const students = months.map((m) => m.students || 0);
    const employers = months.map((m) => m.employers || 0);
    return {
      labels,
      datasets: [
        {
          label: 'Students',
          data: students,
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13,110,253,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#0d6efd',
        },
        {
          label: 'Employers',
          data: employers,
          borderColor: '#198754',
          backgroundColor: 'rgba(25,135,84,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#198754',
        },
      ],
    };
  }, [analytics]);

  const categoryData = useMemo(() => {
    const cats = analytics?.jobsByCategory || [];
    return {
      labels: cats.map((c) => c.category || c.name || ''),
      datasets: [
        {
          label: 'Jobs',
          data: cats.map((c) => c.count || 0),
          backgroundColor: [
            '#0d6efd', '#198754', '#6f42c1', '#fd7e14', '#0dcaf0',
            '#dc3545', '#ffc107', '#20c997', '#6610f2', '#d63384',
          ],
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    };
  }, [analytics]);

  const appStatusData = useMemo(() => {
    const statuses = analytics?.applicationStatusDistribution || [];
    const colors = ['#ffc107', '#0dcaf0', '#6f42c1', '#fd7e14', '#198754', '#dc3545'];
    return {
      labels: statuses.map((s) => s.status || s.name || ''),
      datasets: [
        {
          data: statuses.map((s) => s.count || 0),
          backgroundColor: statuses.map((_, i) => colors[i % colors.length]),
          borderWidth: 2,
          borderColor: '#fff',
        },
      ],
    };
  }, [analytics]);

  const recentActivities = useMemo(() => {
    return (dashboard?.recentActivities || []).slice(0, 10);
  }, [dashboard]);

  const topEmployers = useMemo(() => {
    return dashboard?.topEmployers || analytics?.topEmployers || [];
  }, [dashboard, analytics]);

  if (loading) {
    return (
      <div className="container py-4">
        <div className="placeholder-glow mb-4">
          <div className="placeholder col-4 mb-2" style={{ height: 32 }}></div>
          <div className="placeholder col-7" style={{ height: 18 }}></div>
        </div>
        <div className="row g-4 mb-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-xl-2">
              <div className="card border-0 shadow-sm placeholder-glow" style={{ height: 90 }}>
                <div className="card-body">
                  <div className="placeholder col-4 rounded-circle" style={{ height: 52, width: 52 }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm" style={{ height: 320 }}>
              <div className="card-body skeleton-block" style={{ background: '#e9ecef', borderRadius: 8, height: '100%' }}></div>
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm" style={{ height: 320 }}>
              <div className="card-body skeleton-block" style={{ background: '#e9ecef', borderRadius: 8, height: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="mb-4">
        <h3 className="fw-bold mb-1">Admin Dashboard</h3>
        <p className="text-muted mb-0">Welcome back, {user?.name || 'Admin'}. Here's your platform overview.</p>
      </div>

      <div className="row g-4 mb-4">
        {stats.map((s, i) => (
          <StatsCard key={i} {...s} />
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold">Monthly Registrations (Last 12 Months)</h6>
            </div>
            <div className="card-body">
              {monthlyData.labels.length > 0 ? (
                <Line
                  data={monthlyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'top' } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                  }}
                  style={{ minHeight: 260 }}
                />
              ) : (
                <div className="text-center py-5 text-muted">No registration data available.</div>
              )}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold">Application Status Distribution</h6>
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              {appStatusData.labels.length > 0 ? (
                <div style={{ maxWidth: 280, width: '100%' }}>
                  <Doughnut
                    data={appStatusData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      plugins: { legend: { position: 'bottom', labels: { padding: 12 } } },
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-5 text-muted">No data available.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold">Jobs Per Category</h6>
            </div>
            <div className="card-body">
              {categoryData.labels.length > 0 ? (
                <Bar
                  data={categoryData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                  }}
                  style={{ minHeight: 260 }}
                />
              ) : (
                <div className="text-center py-5 text-muted">No category data available.</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold">Recent Activity</h6>
              <span className="badge bg-light text-dark">Last 10</span>
            </div>
            <div className="card-body p-0" style={{ maxHeight: 300, overflowY: 'auto' }}>
              {recentActivities.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {recentActivities.map((activity, idx) => (
                    <li key={idx} className="list-group-item d-flex align-items-start py-3">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                        style={{
                          width: 36,
                          height: 36,
                          backgroundColor:
                            activity.type === 'student' ? '#0d6efd20' :
                            activity.type === 'employer' ? '#19875420' :
                            activity.type === 'job' ? '#6f42c120' : '#fd7e1420',
                        }}
                      >
                        <BsLightning size={14} color={
                          activity.type === 'student' ? '#0d6efd' :
                          activity.type === 'employer' ? '#198754' :
                          activity.type === 'job' ? '#6f42c1' : '#fd7e14'
                        } />
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-0 small">{activity.message || activity.description || 'Activity'}</p>
                        <small className="text-muted">
                          {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ''}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-muted">No recent activity.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold">Quick Links</h6>
            </div>
            <div className="card-body">
              <div className="row g-2">
                {[
                  { to: '/admin/students', label: 'Manage Students', icon: <BsPeople size={18} />, color: '#0d6efd' },
                  { to: '/admin/employers', label: 'Manage Employers', icon: <BsBuilding size={18} />, color: '#198754' },
                  { to: '/admin/jobs', label: 'Manage Jobs', icon: <BsBriefcase size={18} />, color: '#6f42c1' },
                  { to: '/admin/reports', label: 'Reports', icon: <BsFileEarmarkText size={18} />, color: '#fd7e14' },
                ].map((link) => (
                  <div key={link.to} className="col-6 col-md-3">
                    <Link to={link.to} className="text-decoration-none">
                      <div className="card border h-100 hover-shadow text-center py-3" style={{ transition: 'transform 0.15s' }}>
                        <div className="mb-2" style={{ color: link.color }}>{link.icon}</div>
                        <small className="fw-semibold text-dark">{link.label}</small>
                        <BsChevronRight size={12} className="text-muted mx-auto mt-1" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0 fw-semibold">Top Employers</h6>
            </div>
            <div className="card-body p-0">
              {topEmployers.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Company</th>
                        <th className="text-center">Jobs Posted</th>
                        <th className="text-center">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topEmployers.slice(0, 5).map((emp, idx) => (
                        <tr key={emp._id || idx}>
                          <td className="text-muted">{idx + 1}</td>
                          <td className="fw-semibold">{emp.companyName || emp.name || 'N/A'}</td>
                          <td className="text-center">
                            <span className="badge bg-primary">{emp.jobsPosted || emp.jobCount || 0}</span>
                          </td>
                          <td className="text-center">
                            <BsStar size={12} className="text-warning me-1" />
                            {emp.rating || emp.averageRating || '0.0'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">No employer data available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
