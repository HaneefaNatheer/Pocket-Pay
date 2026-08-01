import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { studentService } from '../../services/studentService';
import { BsArrowLeft, BsBookmarkHeart, BsBookmarkFill, BsGeoAlt, BsClock, BsBuilding, BsCheckCircle, BsPersonLock, BsCashCoin, BsBriefcase } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const SALARY_SUFFIX = { hourly: '/hr', daily: '/day', weekly: '/wk', monthly: '/mo', fixed: '' };

const formatSalary = (job) => {
  const suffix = SALARY_SUFFIX[job?.salary_type] ?? '/hr';
  const num = (v) => (v == null ? null : Number(v).toLocaleString());
  if (job?.salary_min && job?.salary_max) return `$${num(job.salary_min)} - $${num(job.salary_max)}${suffix}`;
  if (job?.salary_min) return `From $${num(job.salary_min)}${suffix}`;
  if (job?.salary_max) return `Up to $${num(job.salary_max)}${suffix}`;
  return null;
};

const toArray = (v) => {
  if (Array.isArray(v)) return v;
  if (!v) return [];
  if (typeof v === 'string') {
    try { return JSON.parse(v); } catch { return v.split('\n').filter(Boolean); }
  }
  return [];
};

const mapJob = (j) => ({
  id: j?.id,
  title: j?.title || 'Untitled Job',
  company: j?.employer?.company_name || j?.company?.name || 'Company',
  logo: j?.employer?.company_logo || j?.company?.logo,
  verified: !!(j?.employer?.is_verified || j?.company?.verified),
  type: j?.job_type || j?.type || 'onsite',
  category: j?.category,
  location: j?.location,
  salary_min: j?.salary?.min ?? j?.salary_min,
  salary_max: j?.salary?.max ?? j?.salary_max,
  salary_type: j?.salary?.type || j?.salary_type || 'hourly',
  description: j?.description || '',
  requirements: toArray(j?.requirements),
  skills: toArray(j?.required_skills || j?.skills),
  days: toArray(j?.available_days || j?.schedule?.days),
  hours: j?.available_hours_start && j?.available_hours_end
    ? `${j.available_hours_start} - ${j.available_hours_end}`
    : j?.schedule?.hours || '',
  shiftDuration: j?.shift_duration,
  workersNeeded: j?.workers_needed ?? j?.workersNeeded ?? 1,
  workersHired: j?.workers_hired ?? j?.workersHired ?? 0,
  deadline: j?.deadline,
  isUrgent: !!j?.is_urgent,
  benefits: j?.benefits,
  companyDescription: j?.employer?.company_description || j?.company?.description,
});

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCvModal, setShowCvModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [hasCv, setHasCv] = useState(false);

  useEffect(() => {
    if (user?.role !== 'student') return;
    studentService.getProfile()
      .then((res) => setHasCv(!!res.data?.data?.cv_file))
      .catch(() => setHasCv(false));
  }, [user]);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await jobService.getById(id);
        const jobData = mapJob(res.data?.data || res.data);
        setJob(jobData);
        setSaved(jobData?.isSaved || false);
        if (jobData?.category) {
          try {
            const relRes = await jobService.getAll({ category: jobData.category, limit: 4 });
            setRelatedJobs((relRes.data?.data || relRes.data || []).map(mapJob).filter((j) => j.id !== Number(id)).slice(0, 3));
          } catch { setRelatedJobs([]); }
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load job details.');
        if (err?.response?.status !== 404) navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id, navigate]);

  const handleSave = async () => {
    try {
      if (saved) {
        await jobService.unsave(id);
        setSaved(false);
        toast.info('Job removed from saved.');
      } else {
        await jobService.save(id);
        setSaved(true);
        toast.success('Job saved!');
      }
    } catch (err) {
      toast.error('Failed to save job.');
    }
  };

  const openApply = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can apply for jobs. Please login as a student.');
      return;
    }
    if (!hasCv) {
      setShowCvModal(true);
      return;
    }
    setShowApplyModal(true);
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await applicationService.apply({ job_id: id, cover_letter: coverLetter });
      toast.success('Application submitted!');
      setShowApplyModal(false);
      setCoverLetter('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit application.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="placeholder-glow">
          <div className="placeholder col-4 mb-3" style={{ height: 32 }}></div>
          <div className="placeholder col-6 mb-2" style={{ height: 24 }}></div>
          <div className="placeholder col-3 mb-4" style={{ height: 20 }}></div>
          <div className="placeholder col-12 mb-2" style={{ height: 200 }}></div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  const salary = formatSalary(job);

  return (
    <div className="container py-4">
      <button className="btn btn-link text-decoration-none mb-3 p-0" onClick={() => navigate(-1)}>
        <BsArrowLeft className="me-1" /> Back to Jobs
      </button>

      {job.isUrgent && (
        <span className="badge bg-danger mb-3"><BsBriefcase className="me-1" />URGENT</span>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 className="fw-bold mb-1">{job.title}</h3>
                  <p className="text-muted mb-2 d-flex align-items-center">
                    <BsBuilding className="me-1" />
                    {job.company}
                    {job.verified && <BsCheckCircle className="ms-1 text-primary" />}
                  </p>
                </div>
                <button className="btn btn-outline-danger btn-sm" onClick={handleSave} type="button">
                  {saved ? <BsBookmarkFill /> : <BsBookmarkHeart />}
                </button>
              </div>

              <div className="d-flex flex-wrap gap-3 mb-4">
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2">
                  <BsClock className="me-1" />{job.type}
                </span>
                {job.category && (
                  <span className="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2">{job.category}</span>
                )}
                {job.location && (
                  <span className="badge bg-info bg-opacity-10 text-info px-3 py-2">
                    <BsGeoAlt className="me-1" />{job.location}
                  </span>
                )}
                {salary && (
                  <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                    <BsCashCoin className="me-1" />{salary}
                  </span>
                )}
              </div>

              {job.logo && (
                <img src={`http://localhost:5000/${job.logo}`} alt={job.company} className="mb-3" style={{ maxHeight: 60 }} />
              )}

              <div className="mb-4">
                <h5 className="fw-semibold">Description</h5>
                <div className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{job.description}</div>
              </div>

              {job.requirements.length > 0 && (
                <div className="mb-4">
                  <h5 className="fw-semibold">Requirements</h5>
                  <ul className="list-unstyled">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="mb-2 d-flex align-items-start">
                        <BsCheckCircle className="text-success me-2 mt-1 flex-shrink-0" />
                        <span className="text-muted">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.skills.length > 0 && (
                <div className="mb-4">
                  <h5 className="fw-semibold">Required Skills</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {job.skills.map((skill, i) => (
                      <span key={i} className="badge bg-primary px-3 py-2">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {job.days.length > 0 && (
                <div className="mb-4">
                  <h5 className="fw-semibold">Available Schedule</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {job.days.map((day, i) => (
                      <span key={i} className="badge bg-light text-dark">{day}</span>
                    ))}
                  </div>
                  {job.hours && (
                    <p className="text-muted mt-2 mb-0"><BsClock className="me-1" />{job.hours}</p>
                  )}
                </div>
              )}

              {job.benefits && (
                <div className="mb-4">
                  <h5 className="fw-semibold">Benefits</h5>
                  <div className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{job.benefits}</div>
                </div>
              )}

              <div className="d-flex gap-3">
                <button className="btn btn-primary btn-lg px-4" onClick={openApply} type="button">
                  Apply Now
                </button>
                <button className="btn btn-outline-danger btn-lg" onClick={handleSave} type="button">
                  {saved ? <><BsBookmarkFill className="me-1" />Saved</> : <><BsBookmarkHeart className="me-1" />Save Job</>}
                </button>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Location</h5>
            </div>
            <div className="card-body">
              <div className="rounded overflow-hidden" style={{ height: 200, background: '#e9ecef' }}>
                <iframe
                  title="Map"
                  width="100%"
                  height="200"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(job.location || 'Sri Lanka')}&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>
              <p className="text-muted small mt-2"><BsGeoAlt className="me-1" />{job.location || 'Remote'}</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Company Info</h5>
            </div>
            <div className="card-body text-center">
              {job.logo ? (
                <img src={`http://localhost:5000/${job.logo}`} alt={job.company} className="mb-3 rounded" style={{ maxHeight: 60 }} />
              ) : (
                <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                  <BsBuilding size={24} className="text-primary" />
                </div>
              )}
              <h5 className="fw-semibold">{job.company}</h5>
              {job.verified && <span className="badge bg-primary mb-2"><BsCheckCircle className="me-1" />Verified</span>}
              {job.companyDescription && (
                <p className="text-muted small">{job.companyDescription}</p>
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Job Details</h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <small className="text-muted">Workers Needed</small>
                <small className="fw-semibold">{job.workersHired}/{job.workersNeeded} hired</small>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <small className="text-muted">Shift Duration</small>
                <small className="fw-semibold">
                  {job.shiftDuration ? (job.shiftDuration >= 60 ? `${Math.floor(job.shiftDuration / 60)}h ${job.shiftDuration % 60 ? job.shiftDuration % 60 + 'm' : ''}`.trim() : `${job.shiftDuration}m`) : 'Flexible'}
                </small>
              </div>
              {job.deadline && (
                <div className="d-flex justify-content-between mb-2">
                  <small className="text-muted">Deadline</small>
                  <small className="fw-semibold">{new Date(job.deadline).toLocaleDateString()}</small>
                </div>
              )}
            </div>
          </div>

          {relatedJobs.length > 0 && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom">
                <h5 className="mb-0 fw-semibold">Related Jobs</h5>
              </div>
              <div className="card-body">
                {relatedJobs.map((rj) => (
                  <Link to={`/jobs/${rj.id}`} key={rj.id} className="text-decoration-none">
                    <div className="d-flex align-items-start mb-3 pb-3 border-bottom">
                      <div className="rounded bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 40, height: 40 }}>
                        <BsBuilding size={16} className="text-primary" />
                      </div>
                      <div>
                        <h6 className="mb-0 small fw-semibold text-dark">{rj.title}</h6>
                        <small className="text-muted">{rj.company}</small>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Apply for {job.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-semibold">Cover Letter</Form.Label>
            <Form.Control
              as="textarea"
              rows="5"
              placeholder="Write a cover letter explaining why you're a great fit for this role..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowApplyModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleApply} disabled={applying}>
            {applying ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAuthModal} onHide={() => setShowAuthModal(false)} centered>
        <Modal.Body className="text-center py-5 px-4">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 70, height: 70, background: '#fff7ed' }}>
            <BsPersonLock size={30} style={{ color: '#f97316' }} />
          </div>
          <h5 className="fw-bold mb-2">Login or Register Required</h5>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            You need to login or register to apply for jobs.
            <br />Create a free student account in just a minute.
          </p>
          <div className="d-flex flex-column gap-2 justify-content-center">
            <Button variant="primary" size="lg" className="fw-semibold" onClick={() => { setShowAuthModal(false); navigate('/login'); }}>
              Login
            </Button>
            <Button variant="outline-primary" size="lg" className="fw-semibold" onClick={() => { setShowAuthModal(false); navigate('/register/student'); }}>
              Register as Student
            </Button>
            <Button variant="link" className="text-muted" onClick={() => setShowAuthModal(false)}>
              Maybe later
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showCvModal} onHide={() => setShowCvModal(false)} centered>
        <Modal.Body className="text-center py-5 px-4">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 70, height: 70, background: '#fef2f2' }}>
            <BsBriefcase size={30} style={{ color: '#ef4444' }} />
          </div>
          <h5 className="fw-bold mb-2">CV Required</h5>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
            You need to upload your CV before applying to jobs.
            <br />Add your CV in your profile settings.
          </p>
          <div className="d-flex gap-2 justify-content-center">
            <Button variant="outline-secondary" onClick={() => setShowCvModal(false)}>Later</Button>
            <Link to="/student/profile" className="btn btn-primary fw-semibold px-4" onClick={() => setShowCvModal(false)}>
              Go to Profile
            </Link>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default JobDetails;
