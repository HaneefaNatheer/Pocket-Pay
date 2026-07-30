import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { employerService } from '../../services/employerService';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { BsBriefcase, BsCheckCircle, BsPeople, BsLightning, BsPlusLg, BsEye, BsPerson } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatsCard = ({ icon, label, value, color, link }) => (
  <div className="col-12 col-sm-6 col-lg-3 mb-4">
    <Link to={link} className="text-decoration-none">
      <div className="card border-0 shadow-sm h-100 stats-card">
        <div className="card-body d-flex align-items-center">
          <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: 56, height: 56, backgroundColor: `${color}20` }}>
            {icon}
          </div>
          <div>
            <h4 className="mb-0 fw-bold">{value}</h4>
            <small className="text-muted">{label}</small>
          </div>
        </div>
      </div>
    </Link>
  </div>
);

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

const EmployerDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes] = await Promise.all([
          employerService.getMyJobs(),
          employerService.getProfile(),
        ]);
        const jobList = (jobsRes.data?.data || jobsRes.data || []).map(j => ({ ...j, _id: j._id || j.id }));
        setJobs(jobList);
        try {
          const allApps = [];
          for (const job of jobList.slice(0, 10)) {
            try {
              const appRes = await employerService.getJobApplicants(job._id);
              const appList = (appRes.data?.data || appRes.data || []).map(a => ({ ...a, _id: a._id || a.id }));
              appList.forEach((a) => allApps.push({ ...a, job }));
            } catch { }
          }
          setApplications(allApps);
        } catch { }
      } catch (err) {
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j) => j.status === 'active' || j.status === 'open').length;
    const totalApps = applications.length;
    const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newApps = applications.filter((a) => new Date(a.createdAt).getTime() > lastWeek).length;
    return { totalJobs, activeJobs, totalApps, newApps };
  }, [jobs, applications]);

  const pieData = useMemo(() => {
    const statusCounts = {};
    applications.forEach((a) => {
      const s = (a.status || 'pending').toLowerCase();
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);
    const colors = ['#ffc107', '#0dcaf0', '#6f42c1', '#fd7e14', '#198754', '#dc3545'];
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderWidth: 2,
        borderColor: '#fff',
      }],
    };
  }, [applications]);

  const recentApplications = useMemo(() =>
    [...applications].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [applications]
  );

  const jobPerformance = useMemo(() =>
    jobs.slice(0, 5).map((j) => ({
      ...j,
      appCount: applications.filter((a) => a.job?._id === j._id || a.job?._id?.toString() === j._id?.toString()).length,
    })),
    [jobs, applications]
  );

  if (loading) {
    return (
      <div className="container py-4">
        <div className="placeholder-glow mb-4">
          <div className="placeholder col-5 mb-2" style={{ height: 32 }}></div>
          <div className="placeholder col-8" style={{ height: 18 }}></div>
        </div>
        <div className="row g-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm placeholder-glow" style={{ height: 100 }}>
                <div className="card-body">
                  <div className="placeholder col-4 rounded-circle" style={{ height: 56, width: 56 }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton-block mt-4" style={{ height: 200, background: '#e9ecef', borderRadius: 8 }}></div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h2 className="fw-bold">Welcome back, {user?.companyName || user?.name || 'Employer'}!</h2>
        <p className="text-muted">Here's an overview of your hiring activity.</p>
      </div>

      <div className="row g-4 mb-4">
        <StatsCard
          icon={<BsBriefcase size={24} color="#0d6efd" />}
          label="Total Jobs"
          value={stats.totalJobs}
          color="#0d6efd"
          link="/employer/manage-jobs"
        />
        <StatsCard
          icon={<BsCheckCircle size={24} color="#198754" />}
          label="Active Jobs"
          value={stats.activeJobs}
          color="#198754"
          link="/employer/manage-jobs"
        />
        <StatsCard
          icon={<BsPeople size={24} color="#6f42c1" />}
          label="Total Applications"
          value={stats.totalApps}
          color="#6f42c1"
          link="/employer/manage-jobs"
        />
        <StatsCard
          icon={<BsLightning size={24} color="#fd7e14" />}
          label="New (Last 7 Days)"
          value={stats.newApps}
          color="#fd7e14"
          link="/employer/manage-jobs"
        />
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">Recent Applications</h5>
              <Link to="/employer/manage-jobs" className="btn btn-sm btn-outline-primary">View All Jobs</Link>
            </div>
            <div className="card-body p-0">
              {recentApplications.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Student</th>
                        <th>Job</th>
                        <th>Applied</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((app) => (
                        <tr key={app._id}>
                          <td className="fw-semibold">{app.student?.user?.name || app.student?.name || app.user?.name || 'N/A'}</td>
                          <td>{app.job?.title || 'N/A'}</td>
                          <td className="text-muted">{new Date(app.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge rounded-pill ${statusBadge(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">No applications yet.</div>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Job Performance</h5>
            </div>
            <div className="card-body p-0">
              {jobPerformance.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Job Title</th>
                        <th>Category</th>
                        <th className="text-center">Views</th>
                        <th className="text-center">Applicants</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobPerformance.map((job) => (
                        <tr key={job._id}>
                          <td className="fw-semibold">{job.title}</td>
                          <td><span className="badge bg-light text-dark">{job.category || 'N/A'}</span></td>
                          <td className="text-center"><BsEye className="me-1 text-muted" />{job.views || 0}</td>
                          <td className="text-center"><BsPeople className="me-1 text-muted" />{job.appCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">No jobs posted yet.</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Application Status</h5>
            </div>
            <div className="card-body d-flex justify-content-center">
              {applications.length > 0 ? (
                <div style={{ maxWidth: 260, width: '100%' }}>
                  <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { padding: 12 } } } }} />
                </div>
              ) : (
                <div className="text-center py-3 text-muted small">No data to display.</div>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Quick Actions</h5>
            </div>
            <div className="card-body d-grid gap-2">
              <Link to="/employer/post-job" className="btn btn-primary d-flex align-items-center gap-2">
                <BsPlusLg /> Post New Job
              </Link>
              <Link to="/employer/manage-jobs" className="btn btn-outline-primary d-flex align-items-center gap-2">
                <BsBriefcase /> View All Jobs
              </Link>
              <Link to="/employer/profile" className="btn btn-outline-secondary d-flex align-items-center gap-2">
                <BsPerson /> Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
