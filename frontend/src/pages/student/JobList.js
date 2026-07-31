import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobService } from '../../services/jobService';
import { BsSearch, BsFilter, BsSortDown, BsGeoAlt, BsClock, BsBuilding, BsBriefcase, BsCashCoin, BsXLg } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const SALARY_SUFFIX = { hourly: '/hr', daily: '/day', weekly: '/wk', monthly: '/mo', fixed: '' };

const TYPE_STYLES = {
  internship: { bg: 'bg-info', text: 'text-info' },
  'part-time': { bg: 'bg-primary', text: 'text-primary' },
  freelance: { bg: 'bg-warning', text: 'text-warning' },
  remote: { bg: 'bg-success', text: 'text-success' },
  tutoring: { bg: 'bg-danger', text: 'text-danger' },
  delivery: { bg: 'bg-secondary', text: 'text-secondary' },
  retail: { bg: 'bg-dark', text: 'text-dark' },
  'food-service': { bg: 'bg-warning', text: 'text-warning' },
  admin: { bg: 'bg-info', text: 'text-info' },
  tech: { bg: 'bg-primary', text: 'text-primary' },
  creative: { bg: 'bg-danger', text: 'text-danger' },
  other: { bg: 'bg-secondary', text: 'text-secondary' },
};

const AVATAR_COLORS = ['#6f42c1', '#0d6efd', '#d63384', '#198754', '#fd7e14', '#0dcaf0', '#dc3545', '#20c997'];

const mapJob = (j) => ({
  id: j._id || j.id,
  title: j.title || 'Untitled Job',
  type: j.type || 'part-time',
  job_type: j.job_type || 'onsite',
  company: j.company?.name || j.employer?.company_name || 'Company',
  logo: j.company?.logo || j.employer?.company_logo,
  salary_min: j.salary?.min ?? j.salary_min,
  salary_max: j.salary?.max ?? j.salary_max,
  salary_type: j.salary?.type || j.salary_type || 'hourly',
  location: j.location,
  skills: j.skills || j.required_skills || [],
  createdAt: j.createdAt || j.created_at,
  deadline: j.deadline,
  category: j.category,
  is_urgent: j.is_urgent,
});

const formatSalary = (job) => {
  const suffix = SALARY_SUFFIX[job.salary_type] ?? '/hr';
  const num = (v) => (v == null ? null : Number(v).toLocaleString());
  if (job.salary_min && job.salary_max) return `$${num(job.salary_min)} - $${num(job.salary_max)}${suffix}`;
  if (job.salary_min) return `From $${num(job.salary_min)}${suffix}`;
  if (job.salary_max) return `Up to $${num(job.salary_max)}${suffix}`;
  return null;
};

const avatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const JobCard = ({ job }) => {
  const salary = formatSalary(job);
  const typeStyle = TYPE_STYLES[job.type] || TYPE_STYLES.other;
  return (
    <div className="col-12 col-md-6 col-xl-4 mb-4">
      <div
        className="card h-100 border-0 rounded-4 overflow-hidden"
        style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.05)', transition: 'box-shadow .18s ease, transform .18s ease' }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 10px rgba(15,23,42,0.08), 0 16px 36px rgba(15,23,42,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        {job.is_urgent && (
          <div className="position-absolute top-0 end-0 m-2">
            <span className="badge bg-danger rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>URGENT</span>
          </div>
        )}
        <div className="card-body d-flex flex-column p-4">
          <div className="d-flex align-items-center gap-3 mb-3">
            {job.logo ? (
              <img src={`http://localhost:5000/${job.logo}`} alt={job.company} className="rounded-3" style={{ width: 46, height: 46, objectFit: 'cover' }} />
            ) : (
              <div className="d-flex align-items-center justify-content-center rounded-3 fw-bold text-white" style={{ width: 46, height: 46, backgroundColor: avatarColor(job.company), fontSize: '1.05rem' }}>
                {job.company.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h6 className="mb-0 fw-semibold text-truncate" style={{ fontSize: '1rem' }}>{job.title}</h6>
              <span className="small text-muted d-inline-flex align-items-center gap-1">
                <BsBuilding size={12} /> {job.company}
              </span>
            </div>
          </div>

          {salary ? (
            <div className="d-inline-flex align-items-center gap-1 fw-bold mb-2" style={{ color: '#0d6efd', fontSize: '0.95rem' }}>
              <BsCashCoin /> {salary}
            </div>
          ) : (
            <div className="small text-muted mb-2">Salary not disclosed</div>
          )}

          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <span className={`badge ${typeStyle.bg} bg-opacity-10 ${typeStyle.text} rounded-pill px-2 py-1`} style={{ fontSize: '0.7rem' }}>
              {job.type}
            </span>
            <span className="small text-muted d-inline-flex align-items-center gap-1">
              <BsGeoAlt /> {job.location || (job.job_type === 'remote' ? 'Remote' : 'Location TBD')}
            </span>
            {job.job_type && job.job_type !== 'onsite' && (
              <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1 text-capitalize" style={{ fontSize: '0.7rem' }}>
                {job.job_type}
              </span>
            )}
          </div>

          {job.skills.length > 0 && (
            <div className="mb-3">
              {job.skills.slice(0, 3).map((skill, i) => (
                <span key={i} className="badge bg-light text-dark border me-1 mb-1 rounded-pill px-2 py-1" style={{ fontSize: '0.7rem' }}>{skill}</span>
              ))}
              {job.skills.length > 3 && <span className="small text-muted">+{job.skills.length - 3}</span>}
            </div>
          )}

          <div className="d-flex justify-content-between align-items-center pt-3 mt-auto border-top">
            <small className="text-muted d-inline-flex align-items-center gap-1">
              <BsClock /> {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'New'}
            </small>
            <Link to={`/jobs/${job.id}`} className="btn btn-sm px-3 fw-semibold text-white" style={{ backgroundColor: '#0d6efd', borderRadius: 8 }}>
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const JobSkeleton = () => (
  <div className="col-12 col-md-6 col-xl-4 mb-4">
    <div className="card h-100 border-0 rounded-4 placeholder-glow" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.05)' }}>
      <div className="card-body p-4">
        <div className="d-flex align-items-center gap-3 mb-3">
          <div className="placeholder rounded-3" style={{ width: 46, height: 46 }}></div>
          <div className="flex-grow-1">
            <div className="placeholder col-10 mb-2" style={{ height: 18 }}></div>
            <div className="placeholder col-6" style={{ height: 12 }}></div>
          </div>
        </div>
        <div className="placeholder col-5 mb-3" style={{ height: 16 }}></div>
        <div className="d-flex gap-2 mb-3">
          <span className="placeholder rounded-pill" style={{ width: 70, height: 22 }}></span>
          <span className="placeholder rounded-pill" style={{ width: 90, height: 22 }}></span>
        </div>
        <div className="placeholder col-12" style={{ height: 34 }}></div>
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
  const [salaryMax, setSalaryMax] = useState(200000);
  const [location, setLocation] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['Technology', 'Marketing', 'Finance', 'Design', 'Engineering', 'Healthcare', 'Education', 'Sales'];
  const availableSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++', 'SQL', 'HTML/CSS', 'TypeScript', 'AWS'];

  const activeFilterCount =
    (category ? 1 : 0) + (jobType ? 1 : 0) + (salaryMax < 200000 ? 1 : 0) + (location ? 1 : 0) + selectedSkills.length;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        keyword: search || undefined,
        category: category || undefined,
        job_type: jobType || undefined,
        salary_min: salaryMax > 0 ? 0 : undefined,
        salary_max: salaryMax < 200000 ? salaryMax : undefined,
        location: location || undefined,
        skills: selectedSkills.length ? selectedSkills.join(',') : undefined,
        sort: sort === 'salary-desc' ? 'salary_high' : sort === 'salary-asc' ? 'salary_low' : undefined,
      };
      const res = await jobService.search(params);
      const data = res.data?.data || res.data?.jobs || res.data || [];
      setJobs(Array.isArray(data) ? data.map(mapJob) : []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotalResults(res.data?.pagination?.total || 0);
    } catch (err) {
      toast.error('Failed to fetch jobs.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, jobType, salaryMax, location, selectedSkills, sort]);

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
    setSalaryMax(200000);
    setLocation('');
    setSelectedSkills([]);
    setSort('newest');
    setPage(1);
  };

  const filterSection = (title, children) => (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-2">
        <span className="small fw-semibold text-uppercase" style={{ letterSpacing: '0.04em', fontSize: '0.72rem', color: '#64748b' }}>{title}</span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="py-4" style={{ minHeight: '100vh', backgroundColor: '#f6f8fb' }}>
      <div className="container">
        <div className="row g-4">
          <div className={`col-12 col-lg-3 ${showFilters ? '' : 'd-none d-lg-block'}`}>
            <div className="card border-0 rounded-4 sticky-lg-top" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.05), 0 8px 24px rgba(15,23,42,0.04)', top: 16 }}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0 fw-bold">
                    <BsFilter className="me-1" /> Filters
                    {activeFilterCount > 0 && (
                      <span className="badge bg-primary rounded-pill ms-1" style={{ fontSize: '0.65rem' }}>{activeFilterCount}</span>
                    )}
                  </h6>
                  <div className="d-flex align-items-center gap-2">
                    {activeFilterCount > 0 && (
                      <button className="btn btn-sm btn-link text-decoration-none p-0" onClick={clearFilters}>Clear All</button>
                    )}
                    <button className="btn btn-sm btn-light d-lg-none p-1" onClick={() => setShowFilters(false)}><BsXLg /></button>
                  </div>
                </div>

                {filterSection('Category',
                  <select className="form-select form-select-sm" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                )}

                {filterSection('Job Type',
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className={`btn btn-sm rounded-pill px-3 ${jobType === '' ? 'btn-dark' : 'btn-light'}`}
                      onClick={() => { setJobType(''); setPage(1); }}
                    >
                      All
                    </button>
                    {['onsite', 'remote', 'hybrid'].map((type) => (
                      <button
                        key={type}
                        className={`btn btn-sm rounded-pill px-3 text-capitalize ${jobType === type ? 'btn-dark' : 'btn-light'}`}
                        onClick={() => { setJobType(type); setPage(1); }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}

                {filterSection('Salary',
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-muted">Up to</span>
                      <span className="small fw-semibold">${salaryMax.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      className="form-range"
                      min="0"
                      max="200000"
                      step="5000"
                      value={salaryMax}
                      onChange={(e) => { setSalaryMax(parseInt(e.target.value)); setPage(1); }}
                    />
                  </div>
                )}

                {filterSection('Location',
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-light border-end-0"><BsGeoAlt className="text-muted" /></span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="City or area"
                      value={location}
                      onChange={(e) => { setLocation(e.target.value); setPage(1); }}
                    />
                  </div>
                )}

                {filterSection('Skills',
                  <div className="d-flex flex-wrap gap-2">
                    {availableSkills.map((skill) => (
                      <button
                        key={skill}
                        className={`btn btn-sm rounded-pill px-2 py-1 ${selectedSkills.includes(skill) ? 'btn-primary' : 'btn-light'}`}
                        style={{ fontSize: '0.75rem' }}
                        onClick={() => toggleSkill(skill)}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-9">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-white border-end-0 rounded-start-4"><BsSearch className="text-muted" /></span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  style={{ boxShadow: 'none' }}
                  placeholder="Search jobs by title, skill, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn px-4 fw-semibold text-white rounded-end-4" type="submit" style={{ backgroundColor: '#0d6efd' }}>Search</button>
              </div>
            </form>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div className="d-flex align-items-center gap-2">
                <button className="btn btn-outline-secondary btn-sm d-lg-none rounded-pill" onClick={() => setShowFilters(true)}>
                  <BsFilter className="me-1" /> Filters
                </button>
                <span className="text-muted small">
                  <BsBriefcase className="me-1" /> Showing {jobs.length} of {totalResults} jobs
                </span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <BsSortDown className="text-muted" />
                <select
                  className="form-select form-select-sm rounded-pill"
                  style={{ width: 'auto' }}
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                >
                  <option value="newest">Newest First</option>
                  <option value="salary-desc">Salary (High to Low)</option>
                  <option value="salary-asc">Salary (Low to High)</option>
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
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <nav className="mt-2">
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
              <div className="text-center py-5 bg-white rounded-4" style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}>
                <BsSearch size={44} className="text-muted mb-3" />
                <h5 className="text-muted fw-semibold">No jobs found</h5>
                <p className="text-muted mb-3">Try adjusting your search or filters.</p>
                <button className="btn btn-outline-primary btn-sm rounded-pill px-4" onClick={clearFilters}>Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobList;
