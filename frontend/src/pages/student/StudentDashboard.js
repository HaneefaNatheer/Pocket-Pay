import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { applicationService } from '../../services/applicationService';
import { BsBriefcase, BsBookmarkHeart, BsLightning, BsPersonCheck, BsSearch, BsPerson, BsPlusLg, BsCalendarEvent } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const StatsCard = ({ icon, label, value, color, link }) => (
  <div className="col-12 col-sm-6 col-lg-3 mb-4">
    <Link to={link} className="text-decoration-none">
      <div className={`card border-0 shadow-sm h-100 stats-card`}>
        <div className="card-body d-flex align-items-center">
          <div className={`rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: 56, height: 56, backgroundColor: `${color}20` }}>
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
  const { data: applications, loading: loadingApps } = useFetch('/applications/my');
  const { data: savedJobs, loading: loadingSaved } = useFetch('/saved-jobs');
  const { data: recommended, loading: loadingRec } = useFetch('/jobs/recommended');
  const { data: profile, loading: loadingProfile } = useFetch('/students/profile');

  const [upcomingInterviews, setUpcomingInterviews] = useState([]);
  const [loadingInterviews, setLoadingInterviews] = useState(true);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const res = await applicationService.getInterviews?.() || { data: [] };
        setUpcomingInterviews(res.data || []);
      } catch {
        setUpcomingInterviews([]);
      } finally {
        setLoadingInterviews(false);
      }
    };
    fetchInterviews();
  }, []);

  const profileCompletion = profile ? calculateCompletion(profile) : 0;
  const loading = loadingApps || loadingSaved || loadingRec || loadingProfile;

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
        <h2 className="fw-bold">Welcome back, {user?.name || 'Student'}!</h2>
        <p className="text-muted">Here's an overview of your job search activity.</p>
      </div>

      <div className="row g-4 mb-4">
        <StatsCard
          icon={<BsBriefcase size={24} color="#0d6efd" />}
          label="Applied Jobs"
          value={applications?.length || 0}
          color="#0d6efd"
          link="/student/applied-jobs"
        />
        <StatsCard
          icon={<BsBookmarkHeart size={24} color="#dc3545" />}
          label="Saved Jobs"
          value={savedJobs?.length || 0}
          color="#dc3545"
          link="/student/saved-jobs"
        />
        <StatsCard
          icon={<BsLightning size={24} color="#ffc107" />}
          label="Recommended"
          value={recommended?.length || 0}
          color="#ffc107"
          link="/student/jobs"
        />
        <StatsCard
          icon={<BsPersonCheck size={24} color="#198754" />}
          label="Profile Completion"
          value={`${profileCompletion}%`}
          color="#198754"
          link="/student/profile"
        />
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">Recent Applications</h5>
              <Link to="/student/applied-jobs" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body p-0">
              {applications?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Applied</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 5).map((app) => (
                        <tr key={app._id}>
                          <td className="fw-semibold">{app.job?.title || 'N/A'}</td>
                          <td>{app.job?.company?.name || 'N/A'}</td>
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
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">Recommended Jobs</h5>
              <Link to="/student/jobs" className="btn btn-sm btn-outline-primary">View All</Link>
            </div>
            <div className="card-body">
              {recommended?.length > 0 ? (
                <div className="row g-3">
                  {recommended.slice(0, 3).map((job) => (
                    <div key={job._id} className="col-12 col-md-6 col-xl-4">
                      <Link to={`/jobs/${job._id}`} className="text-decoration-none">
                        <div className="card h-100 border hover-shadow">
                          <div className="card-body">
                            <h6 className="card-title fw-semibold text-dark">{job.title}</h6>
                            <p className="text-muted small mb-1">{job.company?.name}</p>
                            <p className="small mb-2">
                              <span className="badge bg-light text-dark me-1">{job.type}</span>
                              {job.salary && <span className="text-success small">${job.salary?.min?.toLocaleString()} - ${job.salary?.max?.toLocaleString()}</span>}
                            </p>
                            <p className="small text-muted mb-0">
                              {job.location && <><BsSearch className="me-1" />{job.location}</>}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted">No recommendations available.</div>
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
              {loadingInterviews ? (
                <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary"></div></div>
              ) : upcomingInterviews.length > 0 ? (
                upcomingInterviews.map((interview, idx) => (
                  <div key={idx} className="d-flex align-items-start mb-3 pb-3 border-bottom">
                    <div className="rounded-circle bg-orange d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 40, height: 40, backgroundColor: '#fd7e14', color: '#fff' }}>
                      <BsCalendarEvent />
                    </div>
                    <div>
                      <h6 className="mb-0 small fw-semibold">{interview.job?.title || 'Interview'}</h6>
                      <small className="text-muted">{interview.company?.name}</small><br />
                      <small className="text-primary">{new Date(interview.date).toLocaleString()}</small>
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
                <BsSearch /> Search Jobs
              </Link>
              <Link to="/student/profile" className="btn btn-outline-secondary d-flex align-items-center gap-2">
                <BsPerson /> Update Profile
              </Link>
              <Link to="/student/skills" className="btn btn-outline-success d-flex align-items-center gap-2">
                <BsPlusLg /> Add Skills
              </Link>
              <Link to="/student/timetable" className="btn btn-outline-warning d-flex align-items-center gap-2">
                <BsCalendarEvent /> Set Timetable
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function calculateCompletion(profile) {
  const fields = ['name', 'phone', 'university', 'degree', 'yearOfStudy', 'bio', 'address', 'salaryMin', 'salaryMax', 'preferredLocation', 'cv'];
  const filled = fields.filter((f) => {
    const val = profile[f];
    if (f === 'salaryMin' || f === 'salaryMax') return val !== undefined && val !== null;
    return val && String(val).trim() !== '';
  });
  return Math.round((filled.length / fields.length) * 100);
}

export default StudentDashboard;
