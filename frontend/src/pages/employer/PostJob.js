import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import { BsPlusLg, BsX, BsEye, BsArrowLeft, BsCalendarEvent } from 'react-icons/bs';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

const CATEGORIES = ['Technology', 'Marketing', 'Finance', 'Design', 'Engineering', 'Healthcare', 'Education', 'Sales'];
const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Freelance', 'Contract'];
const SALARY_TYPES = ['hourly', 'daily', 'weekly', 'monthly'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const initialForm = {
  title: '',
  description: '',
  category: '',
  jobType: '',
  salaryMin: '',
  salaryMax: '',
  salaryType: 'hourly',
  location: '',
  workType: 'onsite',
  availableDays: [],
  startTime: '',
  endTime: '',
  skills: [],
  skillInput: '',
  maxApplicants: '',
  deadline: '',
  isUrgent: false,
};

const PostJob = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});

  const wordCount = form.description.trim().split(/\s+/).filter(Boolean).length;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleDayToggle = (day) => {
    setForm((prev) => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day],
    }));
    if (errors.availableDays) setErrors((prev) => ({ ...prev, availableDays: '' }));
  };

  const handleSkillAdd = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = form.skillInput.trim().replace(',', '');
      if (skill && !form.skills.includes(skill)) {
        setForm((prev) => ({ ...prev, skills: [...prev.skills, skill], skillInput: '' }));
        if (errors.skills) setErrors((prev) => ({ ...prev, skills: '' }));
      }
    }
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    else if (wordCount < 20) newErrors.description = 'Description must be at least 20 words';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.jobType) newErrors.jobType = 'Job type is required';
    if (!form.salaryMin) newErrors.salaryMin = 'Minimum salary is required';
    if (!form.salaryMax) newErrors.salaryMax = 'Maximum salary is required';
    if (Number(form.salaryMin) > Number(form.salaryMax)) newErrors.salaryMax = 'Max must be >= Min';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (form.availableDays.length === 0) newErrors.availableDays = 'Select at least one day';
    if (!form.startTime) newErrors.startTime = 'Start time is required';
    if (!form.endTime) newErrors.endTime = 'End time is required';
    if (!form.deadline) newErrors.deadline = 'Deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, wordCount]);

  const handleSubmit = async (status = 'active') => {
    if (!validate()) {
      toast.error('Please fix the errors before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        type: form.jobType,
        salary: {
          min: Number(form.salaryMin),
          max: Number(form.salaryMax),
          type: form.salaryType,
        },
        location: form.location,
        workType: form.workType,
        schedule: {
          days: form.availableDays,
          startTime: form.startTime,
          endTime: form.endTime,
        },
        skills: form.skills,
        maxApplicants: form.maxApplicants ? Number(form.maxApplicants) : undefined,
        deadline: form.deadline,
        isUrgent: form.isUrgent,
        status,
      };
      await jobService.create(payload);
      toast.success('Job posted successfully!');
      navigate('/employer/manage-jobs');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to post job.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) => `form-control ${errors[field] ? 'is-invalid' : ''}`;
  const selectClass = (field) => `form-select ${errors[field] ? 'is-invalid' : ''}`;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            <BsArrowLeft />
          </button>
          <h4 className="fw-bold mb-0">Post a New Job</h4>
        </div>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          <BsEye className="me-1" />
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {showPreview ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="border-bottom pb-3 mb-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h4 className="fw-bold">{form.title || 'Job Title'}</h4>
                  <span className="badge bg-primary me-2">{form.category || 'Category'}</span>
                  <span className="badge bg-light text-dark me-2">{form.jobType || 'Job Type'}</span>
                  {form.isUrgent && <span className="badge bg-danger">Urgent</span>}
                </div>
                <div className="text-end">
                  {form.salaryMin && form.salaryMax && (
                    <h5 className="text-success mb-0">
                      ${Number(form.salaryMin).toLocaleString()} - ${Number(form.salaryMax).toLocaleString()}
                      <small className="text-muted"> /{form.salaryType}</small>
                    </h5>
                  )}
                </div>
              </div>
            </div>
            <p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>{form.description || 'No description provided.'}</p>
            <div className="row g-3 mb-3">
              <div className="col-6 col-md-3">
                <small className="text-muted d-block">Location</small>
                <span className="fw-semibold">{form.location || 'N/A'}</span>
              </div>
              <div className="col-6 col-md-3">
                <small className="text-muted d-block">Work Type</small>
                <span className="fw-semibold text-capitalize">{form.workType}</span>
              </div>
              <div className="col-6 col-md-3">
                <small className="text-muted d-block">Schedule</small>
                <span className="fw-semibold">{form.availableDays.join(', ') || 'N/A'}</span>
              </div>
              <div className="col-6 col-md-3">
                <small className="text-muted d-block">Hours</small>
                <span className="fw-semibold">{form.startTime && form.endTime ? `${form.startTime} - ${form.endTime}` : 'N/A'}</span>
              </div>
            </div>
            {form.skills.length > 0 && (
              <div className="mb-3">
                <small className="text-muted d-block mb-1">Skills</small>
                {form.skills.map((s, i) => (
                  <span key={i} className="badge bg-primary bg-opacity-10 text-primary me-1 mb-1">{s}</span>
                ))}
              </div>
            )}
            {form.deadline && (
              <p className="text-muted small"><BsCalendarEvent className="me-1" /> Deadline: {form.deadline}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h5 className="fw-semibold mb-3 border-bottom pb-2">Basic Information</h5>
            <div className="row g-3 mb-4">
              <div className="col-12">
                <label className="form-label small fw-semibold">Job Title *</label>
                <input
                  type="text"
                  className={inputClass('title')}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Part-time Software Developer"
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  Description * <span className="text-muted fw-normal">({wordCount} words)</span>
                </label>
                <textarea
                  className={inputClass('description')}
                  name="description"
                  rows="5"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the job responsibilities, requirements, and benefits..."
                />
                {errors.description && <div className="invalid-feedback">{errors.description}</div>}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Category *</label>
                <select className={selectClass('category')} name="category" value={form.category} onChange={handleChange}>
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category}</div>}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Job Type *</label>
                <select className={selectClass('jobType')} name="jobType" value={form.jobType} onChange={handleChange}>
                  <option value="">Select Job Type</option>
                  {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.jobType && <div className="invalid-feedback">{errors.jobType}</div>}
              </div>
            </div>

            <h5 className="fw-semibold mb-3 border-bottom pb-2">Compensation</h5>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Min Salary ($) *</label>
                <input
                  type="number"
                  className={inputClass('salaryMin')}
                  name="salaryMin"
                  value={form.salaryMin}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
                {errors.salaryMin && <div className="invalid-feedback">{errors.salaryMin}</div>}
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Max Salary ($) *</label>
                <input
                  type="number"
                  className={inputClass('salaryMax')}
                  name="salaryMax"
                  value={form.salaryMax}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                />
                {errors.salaryMax && <div className="invalid-feedback">{errors.salaryMax}</div>}
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Salary Type</label>
                <select className="form-select" name="salaryType" value={form.salaryType} onChange={handleChange}>
                  {SALARY_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>

            <h5 className="fw-semibold mb-3 border-bottom pb-2">Location</h5>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Location Name *</label>
                <input
                  type="text"
                  className={inputClass('location')}
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. New York, NY"
                />
                {errors.location && <div className="invalid-feedback">{errors.location}</div>}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Work Type</label>
                <select className="form-select" name="workType" value={form.workType} onChange={handleChange}>
                  <option value="onsite">Onsite</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <h5 className="fw-semibold mb-3 border-bottom pb-2">Schedule</h5>
            <div className="row g-3 mb-4">
              <div className="col-12">
                <label className="form-label small fw-semibold">Available Days *</label>
                <div className="d-flex flex-wrap gap-2">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`btn btn-sm ${form.availableDays.includes(day) ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => handleDayToggle(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {errors.availableDays && <div className="text-danger small mt-1">{errors.availableDays}</div>}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">Start Time *</label>
                <input
                  type="time"
                  className={inputClass('startTime')}
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                />
                {errors.startTime && <div className="invalid-feedback">{errors.startTime}</div>}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-semibold">End Time *</label>
                <input
                  type="time"
                  className={inputClass('endTime')}
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                />
                {errors.endTime && <div className="invalid-feedback">{errors.endTime}</div>}
              </div>
            </div>

            <h5 className="fw-semibold mb-3 border-bottom pb-2">Skills</h5>
            <div className="row g-3 mb-4">
              <div className="col-12">
                <label className="form-label small fw-semibold">Required Skills</label>
                <input
                  type="text"
                  className="form-control"
                  name="skillInput"
                  value={form.skillInput}
                  onChange={handleChange}
                  onKeyDown={handleSkillAdd}
                  placeholder="Type a skill and press Enter or comma"
                />
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {form.skills.map((skill, i) => (
                    <span key={i} className="badge bg-primary bg-opacity-10 text-primary d-flex align-items-center gap-1">
                      {skill}
                      <BsX style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <h5 className="fw-semibold mb-3 border-bottom pb-2">Advanced</h5>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Max Applicants</label>
                <input
                  type="number"
                  className="form-control"
                  name="maxApplicants"
                  value={form.maxApplicants}
                  onChange={handleChange}
                  min="1"
                  placeholder="Unlimited"
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label small fw-semibold">Application Deadline *</label>
                <input
                  type="date"
                  className={inputClass('deadline')}
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                />
                {errors.deadline && <div className="invalid-feedback">{errors.deadline}</div>}
              </div>
              <div className="col-12 col-md-4 d-flex align-items-end">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isUrgent"
                    name="isUrgent"
                    checked={form.isUrgent}
                    onChange={handleChange}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="isUrgent">
                    Mark as Urgent
                  </label>
                </div>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-primary px-4"
                onClick={() => handleSubmit('active')}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Posting...
                  </>
                ) : (
                  'Post Job'
                )}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => handleSubmit('draft')}
                disabled={submitting}
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostJob;
