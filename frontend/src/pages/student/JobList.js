import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { BsSearch, BsFilter, BsSortDown, BsBookmarkHeart, BsGeoAlt, BsClock } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const JobCard = ({ job }) => (
  <div className="col-12 col-md-6 col-lg-4 mb-4">
    <div className="card h-100 border-0 shadow-sm hover-shadow">
      <div className="card-body">
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
            {job.skills.length > 3 && <span className="text-muted small">+{job.skills.length - 3}</span>}
          </div>
        )}
        <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
          <small className="text-muted"><BsClock className="me-1" />{new Date(job.createdAt).toLocaleDateString()}</small>
          <Link to={`/jobs/${job._id}`} className="btn btn-sm btn-primary">View Details</Link>
        </div>
      </div>
    </div>
  </div>
);

const JobSkeleton = () => (
  <div className="col-12 col-md-6 col-lg-4 mb-4">
    <div className="card h-100 border-0 shadow-sm placeholder-glow">
      <div className="card-body">
        <div className="placeholder col-8 mb-2" style={{ height: 20 }}></div>
        <div className="placeholder col-5 mb-2" style={{ height: 14 }}></div>
        <div className="placeholder col-6 mb-2" style={{ height: 14 }}></div>
        <div className="placeholder col-4 mb-3" style={{ height: 14 }}></div>
        <div className="d-flex gap-1 mb-3">
          <span className="placeholder rounded" style={{ width: 60, height: 24 }}></span>
          <span className="placeholder rounded" style={{ width: 60, height: 24 }}></span>
        </div>
        <div className="placeholder col-12" style={{ height: 36 }}></div>
      </div>
    </div>
  </div>
);

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [jobType, setJobType] = useState('');
  const [salaryRange, setSalaryRange] = useState([0, 200000]);
  const [location, setLocation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Technology', 'Marketing', 'Finance', 'Design', 'Engineering', 'Healthcare', 'Education', 'Sales'];
  const availableSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'SQL', 'HTML/CSS', 'TypeScript', 'AWS'];

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search,
        category,
        type: jobType,
        location,
        salaryMin: salaryRange[0],
        salaryMax: salaryRange[1],
        skills: selectedSkills.join(','),
        sort,
      };
      const res = await jobService.getAll(params);
      setJobs(res.data?.jobs || res.data || []);
      setTotalPages(res.data?.totalPages || 1);
      setTotalResults(res.data?.total || 0);
    } catch (err) {
      toast.error('Failed to fetch jobs.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, jobType, salaryRange, location, selectedSkills, sort]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setJobType('');
    setSalaryRange([0, 200000]);
    setLocation('');
    setSelectedSkills([]);
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className={`col-12 col-lg-3 mb-4 ${showFilters ? '' : 'd-none d-lg-block'}`}>
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold">Filters</h6>
              <button className="btn btn-sm btn-link text-decoration-none p-0" onClick={clearFilters}>Clear All</button>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label small fw-semibold">Category</label>
                <select className="form-select form-select-sm" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Job Type</label>
                {['onsite', 'remote', 'hybrid'].map((type) => (
                  <div className="form-check" key={type}>
                    <input
                      className="form-check-input"
                      type="radio"
                      name="jobType"
                      id={`type-${type}`}
                      value={type}
                      checked={jobType === type}
                      onChange={(e) => { setJobType(e.target.value); setPage(1); }}
                    />
                    <label className="form-check-label small text-capitalize" htmlFor={`type-${type}`}>{type}</label>
                  </div>
                ))}
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="jobType"
                    id="type-all"
                    value=""
                    checked={jobType === ''}
                    onChange={(e) => { setJobType(''); setPage(1); }}
                  />
                  <label className="form-check-label small" htmlFor="type-all">All Types</label>
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Salary Range: ${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()}</label>
                <input
                  type="range"
                  className="form-range"
                  min="0"
                  max="200000"
                  step="5000"
                  value={salaryRange[1]}
                  onChange={(e) => { setSalaryRange([salaryRange[0], parseInt(e.target.value)]); setPage(1); }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Location</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Enter location"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Skills</label>
                {availableSkills.map((skill) => (
                  <div className="form-check" key={skill}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`skill-${skill}`}
                      checked={selectedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                    />
                    <label className="form-check-label small" htmlFor={`skill-${skill}`}>{skill}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-9">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><BsSearch /></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search jobs by title, skill, or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">Search</button>
            </div>
          </form>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-outline-secondary btn-sm d-lg-none" onClick={() => setShowFilters(!showFilters)}>
                <BsFilter className="me-1" /> Filters
              </button>
              <span className="text-muted small">Showing {jobs.length} of {totalResults} jobs</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <BsSortDown className="text-muted" />
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
              >
                <option value="newest">Newest</option>
                <option value="salary-desc">Salary (High-Low)</option>
                <option value="salary-asc">Salary (Low-High)</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="row">
              {[...Array(6)].map((_, i) => <JobSkeleton key={i} />)}
            </div>
          ) : jobs.length > 0 ? (
            <>
              <div className="row">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
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
              <BsSearch size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No jobs found</h5>
              <p className="text-muted">Try adjusting your search filters.</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobList;
