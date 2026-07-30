import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { BsBriefcase, BsCheckCircle, BsXCircle, BsHourglassSplit, BsSearch, BsPerson, BsCalendarEvent } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

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

const StudentDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appsRes = await applicationService.getMyApplications();
        setApplications(appsRes.data?.data || appsRes.data || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err?.response?.data || err.message);
        toast.error(err?.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalApps = applications.length;
  const accepted = applications.filter((a) => a.status?.toLowerCase() === 'accepted').length;
  const rejected = applications.filter((a) => a.status?.toLowerCase() === 'rejected').length;
  const pending = applications.filter((a) => !['accepted', 'rejected'].includes(a.status?.toLowerCase())).length;

  if (loading) {
    return (
      <div className="container py-4">
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
        <h2 className="fw-bold">Welcome, {user?.name || 'Student'}!</h2>
        <p className="text-muted">Track your job applications and responses.</p>
      </div>

      <div className="row g-4 mb-4">
        <StatsCard
          icon={<BsBriefcase size={24} color="#0d6efd" />}
          label="Total Applied"
          value={totalApps}
          color="#0d6efd"
          link="/student/applied-jobs"
        />
        <StatsCard
          icon={<BsCheckCircle size={24} color="#198754" />}
          label="Accepted"
          value={accepted}
          color="#198754"
          link="/student/applied-jobs"
        />
        <StatsCard
          icon={<BsXCircle size={24} color="#dc3545" />}
          label="Rejected"
          value={rejected}
          color="#dc3545"
          link="/student/applied-jobs"
        />
        <StatsCard
          icon={<BsHourglassSplit size={24} color="#ffc107" />}
          label="Under Review"
          value={pending}
          color="#ffc107"
          link="/student/applied-jobs"
        />
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">Application Status</h5>
              <Link to="/student/applied-jobs" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body p-0">
              {applications.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Applied</th>
                        <th>Status</th>
                        <th>Employer Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).map((app) => (
                        <tr key={app.id || app._id}>
                          <td className="fw-semibold">{app.job?.title || 'N/A'}</td>
                          <td>{app.job?.company?.name || 'N/A'}</td>
                          <td className="text-muted">{new Date(app.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge rounded-pill ${statusBadge(app.status)}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="small text-muted">
                            {app.employer_notes || (app.status === 'accepted' ? 'Congratulations!' : app.status === 'rejected' ? 'Not selected this time' : '—')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">No applications yet. Start applying!</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Upcoming Interviews</h5>
            </div>
            <div className="card-body">
              {applications.filter((a) => a.status?.toLowerCase() === 'interview').length > 0 ? (
                applications.filter((a) => a.status?.toLowerCase() === 'interview').slice(0, 3).map((app) => (
                  <div key={app.id || app._id} className="d-flex align-items-start mb-3 pb-3 border-bottom">
                    <div className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 40, height: 40, backgroundColor: '#fd7e14', color: '#fff' }}>
                      <BsCalendarEvent />
                    </div>
                    <div>
                      <h6 className="mb-0 small fw-semibold">{app.job?.title || 'Interview'}</h6>
                      <small className="text-muted">{app.job?.company?.name || ''}</small>
                      {app.interview_date && <br />}
                      {app.interview_date && <small className="text-primary">{new Date(app.interview_date).toLocaleString()}</small>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-3 text-muted small">No upcoming interviews.</div>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Quick Actions</h5>
            </div>
            <div className="card-body d-grid gap-2">
              <Link to="/student/jobs" className="btn btn-outline-primary d-flex align-items-center gap-2">
                <BsSearch /> Browse Jobs
              </Link>
              <Link to="/student/profile" className="btn btn-outline-secondary d-flex align-items-center gap-2">
                <BsPerson /> Update Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
