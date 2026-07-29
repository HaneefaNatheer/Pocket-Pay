import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaCamera, FaFileUpload, FaPlus, FaTimes, FaCheck, FaArrowRight, FaArrowLeft, FaBriefcase, FaMapPin, FaDollarSign, FaBookOpen } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';

const allSkills = [
  'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'HTML/CSS',
  'Graphic Design', 'Photoshop', 'Figma', 'Social Media Marketing',
  'Content Writing', 'Data Entry', 'Microsoft Office', 'Excel',
  'Customer Service', 'Communication', 'Leadership', 'Teamwork',
  'Problem Solving', 'Time Management', 'Photography', 'Video Editing',
  'Accounting', 'Tutoring', 'Public Speaking',
];

const StudentProfileSetup = () => {
  const navigate = useNavigate();
  const { user, loadUser } = useAuth();
  const fileInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);

  const [bio, setBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [cvName, setCvName] = useState('');

  const filteredSkills = allSkills.filter(
    (s) => s.toLowerCase().includes(skillSearch.toLowerCase()) && !selectedSkills.includes(s)
  );

  const addSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setSkillSearch('');
    }
  };

  const removeSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleCVChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      setCvName(file.name);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await studentService.updateProfile({
        bio,
        salaryMin: salaryMin || undefined,
        salaryMax: salaryMax || undefined,
        preferredLocation: preferredLocation || undefined,
      });

      for (const skill of selectedSkills) {
        try {
          await studentService.addSkill({ name: skill, proficiency: 'intermediate' });
        } catch (e) {
          // skill might already exist, ignore
        }
      }

      if (profilePicture) {
        const fd = new FormData();
        fd.append('profile_image', profilePicture);
        await studentService.uploadPicture(fd);
      }

      if (cvFile) {
        const fd = new FormData();
        fd.append('cv', cvFile);
        await studentService.uploadCV(fd);
      }

      toast.success('Profile setup complete!');
      await loadUser();
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save profile. You can complete this later.');
      navigate('/student/dashboard');
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { num: 1, label: 'Photo & Bio' },
    { num: 2, label: 'Skills' },
    { num: 3, label: 'Preferences' },
    { num: 4, label: 'CV Upload' },
  ];

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-7">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <h3 className="fw-bold text-dark">Set Up Your Profile</h3>
                  <p className="text-muted small">Complete your profile to get better job matches.</p>
                </div>

                {/* Step Indicator */}
                <div className="d-flex justify-content-center mb-4">
                  {steps.map((s, i) => (
                    <React.Fragment key={s.num}>
                      <div className="text-center">
                        <div
                          className={`rounded-circle d-inline-flex align-items-center justify-content-center fw-bold ${step >= s.num ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                          style={{ width: 36, height: 36, fontSize: '0.85rem' }}
                        >
                          {step > s.num ? <FaCheck size={14} /> : s.num}
                        </div>
                        <div className={`small mt-1 ${step >= s.num ? 'text-primary fw-semibold' : 'text-muted'}`}>
                          {s.label}
                        </div>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`flex-grow-1 align-self-center mx-2 mb-3`} style={{ height: 2, background: step > s.num ? '#4f46e5' : '#dee2e6' }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Step 1: Photo & Bio */}
                {step === 1 && (
                  <div>
                    <h6 className="fw-bold text-primary mb-3"><FaUser className="me-1" /> Profile Photo & Bio</h6>

                    <div className="text-center mb-4">
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center bg-light border position-relative"
                        style={{ width: 120, height: 120, cursor: 'pointer', overflow: 'hidden' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {profilePreview ? (
                          <img src={profilePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <FaCamera size={36} className="text-muted" />
                        )}
                        <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 text-white text-center py-1" style={{ fontSize: '0.7rem' }}>
                          <FaCamera size={10} /> Upload
                        </div>
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={handlePictureChange} />
                      <p className="text-muted small mt-2 mb-0">Click to upload profile picture</p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Bio / About Yourself</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        placeholder="Tell employers about yourself, your interests, and what you're looking for..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={500}
                      />
                      <small className="text-muted">{bio.length}/500 characters</small>
                    </div>
                  </div>
                )}

                {/* Step 2: Skills */}
                {step === 2 && (
                  <div>
                    <h6 className="fw-bold text-primary mb-3"><FaBriefcase className="me-1" /> Your Skills</h6>
                    <p className="text-muted small mb-3">Select skills that match your abilities. This helps us match you with the right jobs.</p>

                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search and add skills..."
                        value={skillSearch}
                        onChange={(e) => setSkillSearch(e.target.value)}
                      />
                      {skillSearch && (
                        <div className="border rounded mt-1 p-2" style={{ maxHeight: 150, overflowY: 'auto' }}>
                          {filteredSkills.length === 0 ? (
                            <small className="text-muted">No matching skills found</small>
                          ) : (
                            filteredSkills.map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                className="badge bg-light text-dark border me-1 mb-1"
                                style={{ cursor: 'pointer', fontSize: '0.8rem' }}
                                onClick={() => addSkill(skill)}
                              >
                                <FaPlus size={10} className="me-1" />{skill}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {selectedSkills.length > 0 && (
                      <div>
                        <label className="form-label fw-semibold small text-muted">Selected Skills:</label>
                        <div className="d-flex flex-wrap gap-1">
                          {selectedSkills.map((skill) => (
                            <span key={skill} className="badge bg-primary d-flex align-items-center gap-1" style={{ fontSize: '0.8rem' }}>
                              {skill}
                              <FaTimes style={{ cursor: 'pointer', fontSize: '0.7rem' }} onClick={() => removeSkill(skill)} />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Preferences */}
                {step === 3 && (
                  <div>
                    <h6 className="fw-bold text-primary mb-3"><FaDollarSign className="me-1" /> Job Preferences</h6>

                    <div className="row mb-3">
                      <div className="col-md-6 mb-3 mb-md-0">
                        <label className="form-label fw-semibold">Min Salary (LKR/hr)</label>
                        <input type="number" className="form-control" placeholder="e.g. 500" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} min="0" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Max Salary (LKR/hr)</label>
                        <input type="number" className="form-control" placeholder="e.g. 1500" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} min="0" />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Preferred Location</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaMapPin className="text-muted" /></span>
                        <input type="text" className="form-control" placeholder="e.g. Colombo, Kandy" value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: CV Upload */}
                {step === 4 && (
                  <div>
                    <h6 className="fw-bold text-primary mb-3"><FaFileUpload className="me-1" /> Upload CV</h6>
                    <p className="text-muted small mb-3">Upload your CV (PDF format) so employers can review your qualifications.</p>

                    <div
                      className="border border-2 border-dashed rounded-4 p-5 text-center"
                      style={{ cursor: 'pointer', borderColor: cvFile ? '#10b981' : '#dee2e6', background: cvFile ? 'rgba(16,185,129,0.05)' : '#fafafa' }}
                      onClick={() => cvInputRef.current?.click()}
                    >
                      {cvFile ? (
                        <>
                          <FaCheck size={36} className="text-success mb-2" />
                          <p className="fw-semibold mb-1">{cvName}</p>
                          <small className="text-success">CV uploaded successfully!</small>
                        </>
                      ) : (
                        <>
                          <FaFileUpload size={36} className="text-muted mb-2" />
                          <p className="fw-semibold mb-1">Click to upload CV</p>
                          <small className="text-muted">PDF format, max 10MB</small>
                        </>
                      )}
                      <input ref={cvInputRef} type="file" accept=".pdf" className="d-none" onChange={handleCVChange} />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="d-flex justify-content-between mt-4">
                  {step > 1 ? (
                    <button type="button" className="btn btn-outline-secondary rounded-3 px-4" onClick={() => setStep(step - 1)}>
                      <FaArrowLeft className="me-1" /> Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 4 ? (
                    <button type="button" className="btn btn-primary rounded-3 px-4" onClick={() => setStep(step + 1)}>
                      Next <FaArrowRight className="ms-1" />
                    </button>
                  ) : (
                    <button type="button" className="btn btn-success rounded-3 px-4" onClick={handleSaveProfile} disabled={saving}>
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          Saving...
                        </>
                      ) : (
                        <><FaCheck className="me-1" /> Complete Setup</>
                      )}
                    </button>
                  )}
                </div>

                <div className="text-center mt-3">
                  <button type="button" className="btn btn-link text-muted small" onClick={() => navigate('/student/dashboard')}>
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileSetup;
