import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { BsArrowLeft, BsBookmarkHeart, BsBookmarkFill, BsGeoAlt, BsClock, BsBuilding, BsCheckCircle } from 'react-icons/bs';
import { toast } from 'react-toastify';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [relatedJobs, setRelatedJobs] = useState([]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await jobService.getById(id);
        const jobData = res.data?.data || res.data;
        setJob(jobData);
        setSaved(jobData?.isSaved || false);
        if (jobData?.category) {
          const relRes = await jobService.getAll({ category: jobData.category, limit: 4 });
          setRelatedJobs((relRes.data?.data || relRes.data || []).filter((j) => j.id !== id && j._id !== id).slice(0, 3));
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

  return (
    <div className="container py-4">
      <button className="btn btn-link text-decoration-none mb-3 p-0" onClick={() => navigate(-1)}>
        <BsArrowLeft className="me-1" /> Back to Jobs
      </button>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h3 className="fw-bold mb-1">{job.title}</h3>
                  <p className="text-muted mb-2 d-flex align-items-center">
                    <BsBuilding className="me-1" />
                    {job.employer?.company_name || job.company?.name}
                    {(job.employer?.is_verified || job.company?.verified) && <BsCheckCircle className="ms-1 text-primary" />}
                  </p>
                </div>
                <button className="btn btn-outline-danger btn-sm" onClick={handleSave}>
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
                {job.salary && (
                  <span className="badge bg-success bg-opacity-10 text-success px-3 py-2">
                    ${job.salary.min?.toLocaleString()} - ${job.salary.max?.toLocaleString()}
                  </span>
                )}
              </div>

              {(job.employer?.company_logo || job.company?.logo) && (
                <img src={job.employer?.company_logo || job.company?.logo} alt={job.employer?.company_name || job.company?.name} className="mb-3" style={{ maxHeight: 60 }} />
              )}

              <div className="mb-4">
                <h5 className="fw-semibold">Description</h5>
                <div className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{job.description}</div>
              </div>

              {job.requirements?.length > 0 && (
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

              {job.skills?.length > 0 && (
                <div className="mb-4">
                  <h5 className="fw-semibold">Required Skills</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {job.skills.map((skill, i) => (
                      <span key={i} className="badge bg-primary px-3 py-2">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {job.schedule && (
                <div className="mb-4">
                  <h5 className="fw-semibold">Available Schedule</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {job.schedule.days?.map((day, i) => (
                      <span key={i} className="badge bg-light text-dark">{day}</span>
                    ))}
                  </div>
                  {job.schedule.hours && (
                    <p className="text-muted mt-2 mb-0"><BsClock className="me-1" />{job.schedule.hours}</p>
                  )}
                </div>
              )}

              <div className="d-flex gap-3">
                <button className="btn btn-primary btn-lg px-4" onClick={() => setShowApplyModal(true)}>
                  Apply Now
                </button>
                <button className="btn btn-outline-danger btn-lg" onClick={handleSave}>
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
              {job.employer?.company_logo ? (
                <img src={job.employer.company_logo} alt={job.employer.company_name} className="mb-3 rounded" style={{ maxHeight: 60 }} />
              ) : job.company?.logo ? (
                <img src={job.company.logo} alt={job.company.name} className="mb-3 rounded" style={{ maxHeight: 60 }} />
              ) : (
                <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                  <BsBuilding size={24} className="text-primary" />
                </div>
              )}
              <h5 className="fw-semibold">{job.employer?.company_name || job.company?.name}</h5>
              {(job.employer?.is_verified || job.company?.verified) && <span className="badge bg-primary mb-2"><BsCheckCircle className="me-1" />Verified</span>}
              {(job.employer?.company_description || job.company?.description) && (
                <p className="text-muted small">{job.employer?.company_description || job.company?.description}</p>
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
                  <Link to={`/jobs/${rj._id}`} key={rj._id} className="text-decoration-none">
                    <div className="d-flex align-items-start mb-3 pb-3 border-bottom">
                      <div className="rounded bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3 flex-shrink-0" style={{ width: 40, height: 40 }}>
                        <BsBuilding size={16} className="text-primary" />
                      </div>
                      <div>
                        <h6 className="mb-0 small fw-semibold text-dark">{rj.title}</h6>
                        <small className="text-muted">{rj.employer?.company_name || rj.company?.name}</small>
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
          <Button variant="primary" onClick={handleApply} disabled={applying || !coverLetter.trim()}>
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
    </div>
  );
};

export default JobDetails;
