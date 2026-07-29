import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import { jobService } from '../../services/jobService';
import { BsBookmarkHeart, BsBookmarkX, BsSearch, BsGeoAlt, BsClock } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const JobCard = ({ job, onUnsave }) => (
  <div className="col-12 col-md-6 col-lg-4 mb-4">
    <div className="card h-100 border-0 shadow-sm">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="card-title fw-bold mb-0">{job.title}</h6>
          <span className="badge bg-light text-dark">{job.type}</span>
        </div>
        <p className="text-muted small mb-1">{job.company?.name}</p>
        {job.salary && (
          <p className="text-success fw-semibold small mb-2">
            ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()}
          </p>
        )}
        <p className="small text-muted mb-2">
          <BsGeoAlt className="me-1" />{job.location || 'Remote'}
        </p>
        {job.skills?.length > 0 && (
          <div className="mb-2">
            {job.skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="badge bg-primary bg-opacity-10 text-primary me-1 mb-1">{skill}</span>
            ))}
          </div>
        )}
        <div className="mt-auto pt-2 border-top d-flex justify-content-between align-items-center">
          <small className="text-muted"><BsClock className="me-1" />{new Date(job.createdAt).toLocaleDateString()}</small>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-danger" onClick={() => onUnsave(job._id)}>
              <BsBookmarkX />
            </button>
            <Link to={`/jobs/${job._id}`} className="btn btn-sm btn-primary">View</Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SavedJobs = () => {
  const { data: savedJobs, loading, refetch } = useFetch('/saved-jobs');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (savedJobs) {
      setTotalPages(Math.ceil(savedJobs.length / itemsPerPage));
    }
  }, [savedJobs]);

  const paginatedJobs = savedJobs?.slice((page - 1) * itemsPerPage, page * itemsPerPage) || [];

  const handleUnsave = async (jobId) => {
    try {
      await jobService.unsave(jobId);
      toast.info('Job removed from saved.');
      refetch();
    } catch (err) {
      toast.error('Failed to remove job.');
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <h3 className="fw-bold mb-4">Saved Jobs</h3>
        <div className="row">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="card h-100 border-0 shadow-sm placeholder-glow">
                <div className="card-body">
                  <div className="placeholder col-8 mb-2" style={{ height: 20 }}></div>
                  <div className="placeholder col-5 mb-2" style={{ height: 14 }}></div>
                  <div className="placeholder col-6 mb-3" style={{ height: 14 }}></div>
                  <div className="placeholder col-12" style={{ height: 36 }}></div>
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
      <h3 className="fw-bold mb-4">Saved Jobs</h3>

      {savedJobs?.length > 0 ? (
        <>
          <div className="row">
            {paginatedJobs.map((job) => (
              <JobCard key={job._id} job={job} onUnsave={handleUnsave} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav>
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
          <BsBookmarkHeart size={48} className="text-muted mb-3" />
          <h5 className="text-muted">No saved jobs yet</h5>
          <p className="text-muted">Browse jobs and save the ones you're interested in.</p>
          <Link to="/student/jobs" className="btn btn-primary">Browse Jobs</Link>
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
