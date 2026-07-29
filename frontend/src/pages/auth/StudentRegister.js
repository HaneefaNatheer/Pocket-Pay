import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaPhone,
  FaUniversity, FaGraduationCap, FaCalendarAlt, FaUserPlus,
  FaHome, FaIdCard, FaMapMarkerAlt, FaArrowLeft, FaArrowRight,
  FaCheck, FaUserCircle, FaBookOpen, FaShieldAlt, FaCamera,
  FaTimes, FaPlus, FaFilePdf, FaDollarSign, FaMapPin,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const getPasswordStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { level: 'weak', color: '#ef4444', width: '33%', text: 'Weak' };
  if (score <= 4) return { level: 'medium', color: '#f59e0b', width: '66%', text: 'Medium' };
  return { level: 'strong', color: '#10b981', width: '100%', text: 'Strong' };
};

const steps = [
  { icon: FaUserCircle, label: 'Personal' },
  { icon: FaMapMarkerAlt, label: 'Address' },
  { icon: FaBookOpen, label: 'Education' },
  { icon: FaShieldAlt, label: 'Security' },
  { icon: FaUser, label: 'Profile' },
];

const suggestedSkills = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Java', 'C++',
  'Communication', 'Leadership', 'Teamwork', 'Problem Solving',
  'Data Entry', 'Social Media', 'Content Writing', 'Photography',
  'Tutoring', 'Customer Service', 'MS Office', 'Photoshop',
];

const inputStyle = {
  borderRadius: '0.5rem',
  border: '1.5px solid #e2e8f0',
  padding: '0.65rem 0.75rem',
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
};

const activeInputStyle = {
  ...inputStyle,
  borderColor: '#7c3aed',
  boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)',
};

const labelStyle = {
  fontSize: '0.82rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '0.35rem',
};

const StudentRegister = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const fileInputRef = useRef(null);
  const cvInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', dateOfBirth: '', nic: '',
    permanentAddress: '', currentAddress: '', sameAsPermanent: false,
    university: '', degree: '', yearOfStudy: '',
    password: '', confirmPassword: '', agreeTerms: false,
  });
  const [profileData, setProfileData] = useState({
    bio: '',
    skills: [],
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [cvFileName, setCvFileName] = useState('');
  const [preferredSalaryMin, setPreferredSalaryMin] = useState('');
  const [preferredSalaryMax, setPreferredSalaryMax] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [registered, setRegistered] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [accountCreated, setAccountCreated] = useState(false);

  const strength = getPasswordStrength(formData.password);

  const calculateAge = (dob) => {
    if (!dob) return '';
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const validateStep = (stepIndex) => {
    const errs = {};
    if (stepIndex === 0) {
      if (!formData.name.trim()) errs.name = 'Full name is required';
      if (!formData.email.trim()) errs.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email';
      if (!formData.phone.trim()) errs.phone = 'Mobile number is required';
      else if (!/^\+?[\d\s\-()]{7,20}$/.test(formData.phone.trim())) errs.phone = 'Enter a valid number';
      if (!formData.dateOfBirth) errs.dateOfBirth = 'Date of birth is required';
      else if (calculateAge(formData.dateOfBirth) < 16) errs.dateOfBirth = 'Must be at least 16 years old';
      if (!formData.nic.trim()) errs.nic = 'NIC is required';
      else if (!/^[0-9]{9}[VvXx]?$|^[0-9]{12}$/.test(formData.nic.trim())) errs.nic = 'Invalid NIC format';
    }
    if (stepIndex === 1) {
      if (!formData.permanentAddress.trim()) errs.permanentAddress = 'Permanent address is required';
      if (!formData.currentAddress.trim()) errs.currentAddress = 'Current address is required';
    }
    if (stepIndex === 2) {
      if (!formData.university.trim()) errs.university = 'University is required';
      if (!formData.degree.trim()) errs.degree = 'Degree is required';
      if (!formData.yearOfStudy) errs.yearOfStudy = 'Year of study is required';
    }
    if (stepIndex === 3) {
      if (!formData.password) errs.password = 'Password is required';
      else if (formData.password.length < 8) errs.password = 'Min 8 characters';
      if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
      if (!formData.agreeTerms) errs.agreeTerms = 'You must agree to the terms';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep(step)) return;

    if (step === 3 && !accountCreated) {
      setLoading(true);
      try {
        const { agreeTerms, confirmPassword, sameAsPermanent, ...submitData } = formData;
        await register({ ...submitData, role: 'student' });
        await login(formData.email, formData.password, 'student');
        setAccountCreated(true);
        toast.success('Account created! Now set up your profile.');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Registration failed.');
        if (err.response?.data?.errors) setErrors(err.response.data.errors);
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'sameAsPermanent') {
      setFormData((prev) => ({
        ...prev,
        sameAsPermanent: checked,
        currentAddress: checked ? prev.permanentAddress : '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
      if (name === 'permanentAddress' && formData.sameAsPermanent) {
        setFormData((prev) => ({ ...prev, currentAddress: value }));
      }
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setProfilePicture(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleCvChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('CV must be less than 10MB');
      return;
    }
    setCvFile(file);
    setCvFileName(file.name);
  };

  const handleAddSkill = (skill) => {
    if (skill && !profileData.skills.includes(skill) && profileData.skills.length < 10) {
      setProfileData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill) => {
    setProfileData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(skillInput.trim());
    }
  };

  const handleSubmitProfile = async () => {
    setLoading(true);
    try {
      if (profilePicture) {
        const fd = new FormData();
        fd.append('profile_image', profilePicture);
        await api.post('/students/upload-picture', fd);
      }

      if (cvFile) {
        const fd = new FormData();
        fd.append('cv', cvFile);
        await api.post('/students/upload-cv', fd);
      }

      await api.put('/students/profile', {
        bio: profileData.bio,
        preferred_salary_min: preferredSalaryMin || null,
        preferred_salary_max: preferredSalaryMax || null,
        preferred_location: preferredLocation || null,
      });

      for (const skill of profileData.skills) {
        try {
          await api.post('/students/skills', { skill_name: skill });
        } catch {}
      }

      toast.success('Profile setup complete!');
      setRegistered(true);
    } catch (err) {
      toast.error('Failed to save profile. You can update later.');
      setRegistered(true);
    } finally {
      setLoading(false);
    }
  };

  const getFieldStyle = (fieldName) => (focusedField === fieldName || formData[fieldName] ? activeInputStyle : inputStyle);

  const renderField = (name, icon, placeholder, type = 'text', options = null) => {
    const hasError = errors[name];
    return (
      <div className="mb-3">
        <label style={labelStyle}>{placeholder}</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: hasError ? '#ef4444' : focusedField === name ? '#7c3aed' : '#9ca3af', zIndex: 2 }}>
            {icon}
          </span>
          {options ? (
            <select
              name={name}
              className={`form-select ${hasError ? 'is-invalid' : ''}`}
              style={{ ...getFieldStyle(name), paddingLeft: '2.5rem' }}
              value={formData[name]}
              onChange={handleChange}
              onFocus={() => setFocusedField(name)}
              onBlur={() => setFocusedField(null)}
            >
              <option value="">{placeholder}</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              name={name}
              className={`form-control ${hasError ? 'is-invalid' : ''}`}
              style={{ ...getFieldStyle(name), paddingLeft: '2.5rem' }}
              placeholder={placeholder}
              value={formData[name]}
              onChange={handleChange}
              onFocus={() => setFocusedField(name)}
              onBlur={() => setFocusedField(null)}
            />
          )}
          {hasError && <div className="invalid-feedback" style={{ fontSize: '0.78rem' }}>{errors[name]}</div>}
        </div>
      </div>
    );
  };

  if (registered) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="card border-0 shadow-lg rounded-4 text-center p-5" style={{ animation: 'slideUp 0.5s ease' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #34d399)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <FaCheck size={32} color="#fff" />
                </div>
                <h3 className="fw-bold mb-2">You're All Set!</h3>
                <p className="text-muted mb-4">Your account and profile are ready. Start exploring part-time job opportunities!</p>
                <Link to="/student/dashboard" className="btn btn-lg rounded-3 px-4 fw-semibold" style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: '#fff', border: 'none' }}>
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-4" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="text-center mb-3">
              <button className="btn btn-sm rounded-3 fw-semibold" style={{ background: '#fff', border: '1.5px solid #e2e8f0', color: '#7c3aed' }} onClick={() => navigate('/register')}>
                <FaArrowLeft className="me-1" /> Choose Account Type
              </button>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed, #a78bfa)', padding: '2rem 2rem 1.5rem', color: '#fff' }}>
                <div className="text-center">
                  <h4 className="fw-bold mb-1">Student Registration</h4>
                  <p className="mb-0" style={{ fontSize: '0.88rem', opacity: 0.85 }}>
                    {step < 4 ? 'Create your account in a few simple steps' : 'Set up your profile to get started'}
                  </p>
                </div>

                <div className="d-flex justify-content-between align-items-center mt-4 px-2">
                  {steps.map((s, i) => (
                    <React.Fragment key={i}>
                      <div className="text-center" style={{ flex: '0 0 auto' }}>
                        <div
                          style={{
                            width: 38, height: 38, borderRadius: '50%',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            background: i < step || (step === 4 && i < 4) ? '#10b981' : i === step ? '#fff' : 'rgba(255,255,255,0.2)',
                            color: i === step ? '#5b21b6' : i < step || (step === 4 && i < 4) ? '#fff' : 'rgba(255,255,255,0.6)',
                            transition: 'all 0.3s ease',
                            fontSize: '0.85rem', fontWeight: 700,
                            border: i === step ? 'none' : '2px solid rgba(255,255,255,0.3)',
                          }}
                        >
                          {i < step || (step === 4 && i < 4) ? <FaCheck size={14} /> : i + 1}
                        </div>
                        <div style={{ fontSize: '0.65rem', marginTop: '0.3rem', opacity: i <= step ? 1 : 0.5 }}>{s.label}</div>
                      </div>
                      {i < steps.length - 1 && (
                        <div style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: 18, background: i < step || (step === 4 && i < 4) ? '#10b981' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s ease', borderRadius: 2 }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="card-body p-4 p-md-5" style={{ minHeight: step === 4 ? 400 : 320 }}>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                  {step === 0 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <h6 className="fw-bold mb-3" style={{ color: '#5b21b6', fontSize: '0.9rem' }}><FaUserCircle className="me-2" />Personal Information</h6>
                      {renderField('name', <FaUser size={14} />, 'Full Name')}
                      <div className="row">
                        <div className="col-md-6">{renderField('email', <FaEnvelope size={14} />, 'Email Address', 'email')}</div>
                        <div className="col-md-6">{renderField('phone', <FaPhone size={14} />, 'Mobile Number', 'tel')}</div>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          {renderField('dateOfBirth', <FaCalendarAlt size={14} />, 'Date of Birth', 'date')}
                          {formData.dateOfBirth && !errors.dateOfBirth && (
                            <small className="text-muted ms-1">Age: {calculateAge(formData.dateOfBirth)} years</small>
                          )}
                        </div>
                        <div className="col-md-6">{renderField('nic', <FaIdCard size={14} />, 'NIC Number')}</div>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <h6 className="fw-bold mb-3" style={{ color: '#5b21b6', fontSize: '0.9rem' }}><FaMapMarkerAlt className="me-2" />Address Information</h6>
                      {renderField('permanentAddress', <FaHome size={14} />, 'Permanent Address')}
                      <div className="form-check mb-3 px-1" style={{ background: '#f8fafc', borderRadius: '0.5rem', padding: '0.6rem 0.8rem', border: '1px solid #e2e8f0' }}>
                        <input type="checkbox" name="sameAsPermanent" className="form-check-input" id="sameAsPermanent" checked={formData.sameAsPermanent} onChange={handleChange} style={{ accentColor: '#7c3aed' }} />
                        <label className="form-check-label small fw-medium ms-2" htmlFor="sameAsPermanent" style={{ color: '#64748b' }}>
                          Current address is the same as permanent
                        </label>
                      </div>
                      {!formData.sameAsPermanent && renderField('currentAddress', <FaMapMarkerAlt size={14} />, 'Current Address')}
                      {formData.sameAsPermanent && (
                        <div className="p-3 rounded-3 mb-3" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                          <small className="text-success fw-medium"><FaCheck className="me-1" />Using permanent address as current address</small>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 2 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <h6 className="fw-bold mb-3" style={{ color: '#5b21b6', fontSize: '0.9rem' }}><FaGraduationCap className="me-2" />Education Information</h6>
                      {renderField('university', <FaUniversity size={14} />, 'University / College / Institute')}
                      {renderField('degree', <FaGraduationCap size={14} />, 'Degree / Program')}
                      {renderField('yearOfStudy', <FaCalendarAlt size={14} />, 'Year of Study', 'select', [
                        { value: '1', label: '1st Year' },
                        { value: '2', label: '2nd Year' },
                        { value: '3', label: '3rd Year' },
                        { value: '4', label: '4th Year' },
                        { value: '5', label: '5th Year' },
                      ])}
                    </div>
                  )}

                  {step === 3 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <h6 className="fw-bold mb-3" style={{ color: '#5b21b6', fontSize: '0.9rem' }}><FaShieldAlt className="me-2" />Account Security</h6>
                      <div className="mb-3">
                        <label style={labelStyle}>Password</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 2 }}><FaLock size={14} /></span>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            style={{ ...getFieldStyle('password'), paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                            placeholder="Min 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => setFocusedField(null)}
                          />
                          <button type="button" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', zIndex: 2 }} onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                          {errors.password && <div className="invalid-feedback" style={{ fontSize: '0.78rem' }}>{errors.password}</div>}
                        </div>
                        {formData.password && (
                          <div className="mt-2">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <div style={{ flex: 1, height: 5, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden', marginRight: 8 }}>
                                <div style={{ width: strength.width, height: '100%', background: strength.color, borderRadius: 3, transition: 'all 0.3s ease' }} />
                              </div>
                              <small style={{ color: strength.color, fontWeight: 600, fontSize: '0.75rem' }}>{strength.text}</small>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mb-3">
                        <label style={labelStyle}>Confirm Password</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 2 }}><FaLock size={14} /></span>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                            style={{ ...getFieldStyle('confirmPassword'), paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('confirmPassword')}
                            onBlur={() => setFocusedField(null)}
                          />
                          <button type="button" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', zIndex: 2 }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                          {errors.confirmPassword && <div className="invalid-feedback" style={{ fontSize: '0.78rem' }}>{errors.confirmPassword}</div>}
                        </div>
                      </div>
                      <div className="form-check mt-3 p-3 rounded-3" style={{ background: '#f8fafc', border: `1.5px solid ${errors.agreeTerms ? '#ef4444' : '#e2e8f0'}` }}>
                        <input type="checkbox" name="agreeTerms" className="form-check-input" id="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} style={{ accentColor: '#7c3aed' }} />
                        <label className="form-check-label small ms-2" htmlFor="agreeTerms" style={{ color: '#64748b' }}>
                          I agree to the <a href="#terms" className="text-decoration-none fw-semibold" style={{ color: '#7c3aed' }}>Terms</a> and <a href="#privacy" className="text-decoration-none fw-semibold" style={{ color: '#7c3aed' }}>Privacy Policy</a>
                        </label>
                        {errors.agreeTerms && <div className="text-danger small mt-1" style={{ fontSize: '0.78rem' }}>{errors.agreeTerms}</div>}
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <h6 className="fw-bold mb-3" style={{ color: '#5b21b6', fontSize: '0.9rem' }}><FaUser className="me-2" />Set Up Your Profile</h6>
                      <p className="text-muted small mb-4">Add a photo and tell us about yourself to stand out to employers.</p>

                      {/* Profile Picture */}
                      <div className="text-center mb-4">
                        <div
                          style={{
                            width: 110, height: 110, borderRadius: '50%', margin: '0 auto',
                            background: profilePreview ? 'none' : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', position: 'relative', overflow: 'hidden',
                            border: '3px dashed #a5b4fc',
                          }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {profilePreview ? (
                            <img src={profilePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className="text-center">
                              <FaCamera size={24} color="#7c3aed" />
                              <div style={{ fontSize: '0.65rem', color: '#7c3aed', fontWeight: 600, marginTop: 2 }}>Add Photo</div>
                            </div>
                          )}
                          <div
                            style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0,
                              background: 'rgba(124, 58, 237, 0.85)', padding: '4px',
                              textAlign: 'center', fontSize: '0.65rem', color: '#fff', fontWeight: 600,
                            }}
                          >
                            <FaCamera size={10} className="me-1" />{profilePreview ? 'Change' : 'Upload'}
                          </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={handlePictureChange} />
                      </div>

                      {/* Bio */}
                      <div className="mb-3">
                        <label style={labelStyle}>Bio</label>
                        <textarea
                          name="bio"
                          className="form-control"
                          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
                          placeholder="Tell employers about yourself, your interests, and what you're looking for..."
                          value={profileData.bio}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                          maxLength={300}
                        />
                        <small className="text-muted">{profileData.bio.length}/300</small>
                      </div>

                      {/* Skills */}
                      <div className="mb-3">
                        <label style={labelStyle}>Skills (up to 10)</label>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {profileData.skills.map((skill) => (
                            <span
                              key={skill}
                              className="d-inline-flex align-items-center rounded-pill px-3 py-1"
                              style={{ background: '#eef2ff', color: '#5b21b6', fontSize: '0.8rem', fontWeight: 600 }}
                            >
                              {skill}
                              <FaTimes
                                size={10}
                                style={{ marginLeft: 6, cursor: 'pointer' }}
                                onClick={() => handleRemoveSkill(skill)}
                              />
                            </span>
                          ))}
                        </div>
                        {profileData.skills.length < 10 && (
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              style={{ ...inputStyle, borderRight: 'none' }}
                              placeholder="Type a skill and press Enter"
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={handleSkillKeyDown}
                            />
                            <button
                              type="button"
                              className="btn"
                              style={{ ...inputStyle, border: '1.5px solid #e2e8f0', borderLeft: 'none', background: '#f8fafc', color: '#7c3aed' }}
                              onClick={() => handleAddSkill(skillInput.trim())}
                              disabled={!skillInput.trim() || profileData.skills.length >= 10}
                            >
                              <FaPlus size={12} />
                            </button>
                          </div>
                        )}
                        <div className="d-flex flex-wrap gap-1 mt-2">
                          {suggestedSkills.filter((s) => !profileData.skills.includes(s)).slice(0, 8).map((skill) => (
                            <button
                              key={skill}
                              type="button"
                              className="btn btn-sm rounded-pill"
                              style={{ background: '#f1f5f9', color: '#64748b', fontSize: '0.72rem', border: '1px solid #e2e8f0' }}
                              onClick={() => handleAddSkill(skill)}
                            >
                              + {skill}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* CV Upload */}
                      <div className="mb-3">
                        <label style={labelStyle}>Upload CV (PDF only, max 10MB)</label>
                        <div
                          style={{ ...inputStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', background: '#f8fafc' }}
                          onClick={() => cvInputRef.current?.click()}
                        >
                          <FaFilePdf size={16} color={cvFile ? '#ef4444' : '#9ca3af'} />
                          <span style={{ flex: 1, fontSize: '0.85rem', color: cvFile ? '#1e293b' : '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {cvFileName || 'Choose PDF file...'}
                          </span>
                          {cvFile && (
                            <FaTimes size={12} style={{ cursor: 'pointer', color: '#94a3b8' }} onClick={(e) => { e.stopPropagation(); setCvFile(null); setCvFileName(''); }} />
                          )}
                        </div>
                        <input ref={cvInputRef} type="file" accept=".pdf" className="d-none" onChange={handleCvChange} />
                      </div>

                      {/* Preferred Salary */}
                      <div className="mb-3">
                        <label style={labelStyle}>Preferred Salary Range (LKR/month)</label>
                        <div className="row g-2">
                          <div className="col-6">
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 2 }}><FaDollarSign size={12} /></span>
                              <input
                                type="number"
                                className="form-control"
                                style={{ ...inputStyle, paddingLeft: '2rem', fontSize: '0.85rem' }}
                                placeholder="Min"
                                value={preferredSalaryMin}
                                onChange={(e) => setPreferredSalaryMin(e.target.value)}
                                min="0"
                              />
                            </div>
                          </div>
                          <div className="col-6">
                            <div style={{ position: 'relative' }}>
                              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 2 }}><FaDollarSign size={12} /></span>
                              <input
                                type="number"
                                className="form-control"
                                style={{ ...inputStyle, paddingLeft: '2rem', fontSize: '0.85rem' }}
                                placeholder="Max"
                                value={preferredSalaryMax}
                                onChange={(e) => setPreferredSalaryMax(e.target.value)}
                                min="0"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Preferred Location */}
                      <div className="mb-3">
                        <label style={labelStyle}>Preferred Job Location</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', zIndex: 2 }}><FaMapPin size={14} /></span>
                          <input
                            type="text"
                            className="form-control"
                            style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                            placeholder="e.g. Colombo, Kandy, Remote"
                            value={preferredLocation}
                            onChange={(e) => setPreferredLocation(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="d-flex justify-content-between mt-4">
                    {step > 0 ? (
                      <button type="button" className="btn rounded-3 px-4 fw-semibold" style={{ background: '#f1f5f9', color: '#475569', border: '1.5px solid #e2e8f0' }} onClick={handleBack}>
                        <FaArrowLeft className="me-1" /> Back
                      </button>
                    ) : <div />}

                    {step < steps.length - 1 ? (
                      <button type="button" className="btn rounded-3 px-4 fw-semibold" style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', color: '#fff', border: 'none' }} onClick={handleNext} disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm" /> : <>{step === 3 ? <><FaCheck className="me-1" /> Create Account</> : <>Next <FaArrowRight className="ms-1" /></>}</>}
                      </button>
                    ) : (
                      <button type="button" className="btn rounded-3 px-4 fw-semibold" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', color: '#fff', border: 'none' }} onClick={handleSubmitProfile} disabled={loading}>
                        {loading ? (
                          <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                        ) : (
                          <><FaCheck className="me-1" /> Finish</>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="text-center pb-4 px-4">
                <p className="small text-muted mb-0">
                  Already have an account? <Link to="/login" className="text-decoration-none fw-semibold" style={{ color: '#7c3aed' }}>Login</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default StudentRegister;
