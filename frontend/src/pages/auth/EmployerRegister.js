import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaBuilding, FaUserTie, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaPhone, FaGlobe, FaMapMarkerAlt, FaIndustry, FaArrowLeft, FaArrowRight,
  FaCheck, FaShieldAlt, FaUser, FaCamera, FaTimes,
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

const industries = ['IT', 'Education', 'Marketing', 'Retail', 'Delivery', 'Healthcare', 'Finance', 'Other'];

const steps = [
  { icon: FaBuilding, label: 'Company' },
  { icon: FaShieldAlt, label: 'Security' },
  { icon: FaUser, label: 'Profile' },
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
  borderColor: '#16a34a',
  boxShadow: '0 0 0 3px rgba(22, 163, 74, 0.1)',
};

const labelStyle = {
  fontSize: '0.82rem',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '0.35rem',
};

const EmployerRegister = () => {
  const navigate = useNavigate();
  const { register, login, setUser } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: '', contactPerson: '', email: '', phone: '',
    companyWebsite: '', companyAddress: '', industry: '',
    businessRegistration: '',
    password: '', confirmPassword: '', agreeTerms: false,
  });
  const [profileData, setProfileData] = useState({ companyDescription: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [registered, setRegistered] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [accountCreated, setAccountCreated] = useState(false);

  const strength = getPasswordStrength(formData.password);

  const validateStep = (stepIndex) => {
    const errs = {};
    if (stepIndex === 0) {
      if (!formData.companyName.trim()) errs.companyName = 'Company name is required';
      if (!formData.contactPerson.trim()) errs.contactPerson = 'Contact person is required';
      if (!formData.email.trim()) errs.email = 'Business email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Email is invalid';
      if (!formData.phone.trim()) errs.phone = 'Phone number is required';
      else if (!/^\+?[\d\s\-()]{7,20}$/.test(formData.phone.trim())) errs.phone = 'Enter a valid phone number';
      if (formData.companyWebsite && !/^https?:\/\/.+/.test(formData.companyWebsite) && !/^www\.+/.test(formData.companyWebsite)) errs.companyWebsite = 'Enter a valid URL (e.g. www.abc.com)';
      if (!formData.companyAddress.trim()) errs.companyAddress = 'Company address is required';
      if (!formData.industry) errs.industry = 'Please select an industry';
    }
    if (stepIndex === 1) {
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

    if (step === 1 && !accountCreated) {
      setLoading(true);
      try {
        const { agreeTerms, confirmPassword, ...submitData } = formData;
        await register({
          ...submitData,
          company_name: formData.companyName,
          contact_person: formData.contactPerson,
          company_website: formData.companyWebsite,
          company_address: formData.companyAddress,
          business_registration: formData.businessRegistration,
          name: formData.contactPerson,
          role: 'employer',
        });
        await login(formData.email, formData.password, 'employer');
        setAccountCreated(true);
        toast.success('Account created! Now set up your company profile.');
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
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const getFieldStyle = (fieldName) => (focusedField === fieldName || formData[fieldName] ? activeInputStyle : inputStyle);

  const renderField = (name, icon, placeholder, type = 'text', options = null) => {
    const hasError = errors[name];
    return (
      <div className="mb-3">
        <label style={labelStyle}>{placeholder}</label>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: hasError ? '#ef4444' : focusedField === name ? '#16a34a' : '#9ca3af', zIndex: 2 }}>
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

  const handleSubmitProfile = async () => {
    setLoading(true);
    try {
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        await api.post('/employers/upload-logo', fd);
      }

      if (profileData.companyDescription.trim()) {
        await api.put('/employers/profile', {
          company_description: profileData.companyDescription,
        });
      }

      toast.success('Profile setup complete!');
      const updated = await api.get('/auth/me');
      setUser(updated.data.data);
      setRegistered(true);
    } catch (err) {
      toast.error('Failed to save profile. You can update later.');
      setRegistered(true);
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5">
              <div className="card border-0 shadow-lg rounded-4 text-center p-5" style={{ animation: 'slideUp 0.5s ease' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <FaCheck size={32} color="#fff" />
                </div>
                <h3 className="fw-bold mb-2">You're All Set!</h3>
                <p className="text-muted mb-4">Your employer account and company profile are ready. Start posting jobs and hiring talented students!</p>
                <Link to="/employer/dashboard" className="btn btn-lg rounded-3 px-4 fw-semibold" style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', border: 'none' }}>
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-4" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #e8f5e9 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="text-center mb-3">
              <button className="btn btn-sm rounded-3 fw-semibold" style={{ background: '#fff', border: '1.5px solid #e2e8f0', color: '#16a34a' }} onClick={() => navigate('/register')}>
                <FaArrowLeft className="me-1" /> Choose Account Type
              </button>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div style={{ background: 'linear-gradient(135deg, #15803d, #16a34a, #22c55e)', padding: '2rem 2rem 1.5rem', color: '#fff' }}>
                <div className="text-center">
                  <h4 className="fw-bold mb-1">Employer Registration</h4>
                  <p className="mb-0" style={{ fontSize: '0.88rem', opacity: 0.85 }}>
                    {step < 2 ? 'Register your company in a few simple steps' : 'Set up your company profile to attract talent'}
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
                            background: i < step || (step === 2 && i < 2) ? '#10b981' : i === step ? '#fff' : 'rgba(255,255,255,0.2)',
                            color: i === step ? '#15803d' : i < step || (step === 2 && i < 2) ? '#fff' : 'rgba(255,255,255,0.6)',
                            transition: 'all 0.3s ease',
                            fontSize: '0.85rem', fontWeight: 700,
                            border: i === step ? 'none' : '2px solid rgba(255,255,255,0.3)',
                          }}
                        >
                          {i < step || (step === 2 && i < 2) ? <FaCheck size={14} /> : i + 1}
                        </div>
                        <div style={{ fontSize: '0.65rem', marginTop: '0.3rem', opacity: i <= step ? 1 : 0.5 }}>{s.label}</div>
                      </div>
                      {i < steps.length - 1 && (
                        <div style={{ flex: 1, height: 2, margin: '0 6px', marginBottom: 18, background: i < step || (step === 2 && i < 2) ? '#10b981' : 'rgba(255,255,255,0.2)', transition: 'all 0.3s ease', borderRadius: 2 }} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="card-body p-4 p-md-5" style={{ minHeight: step === 2 ? 380 : 320 }}>
                <form onSubmit={(e) => e.preventDefault()} noValidate>
                  {step === 0 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <h6 className="fw-bold mb-3" style={{ color: '#15803d', fontSize: '0.9rem' }}><FaBuilding className="me-2" />Company Information</h6>
                      {renderField('companyName', <FaBuilding size={14} />, 'Company Name / Store / Organization')}
                      {renderField('contactPerson', <FaUserTie size={14} />, 'Contact Person')}
                      <div className="row">
                        <div className="col-md-6">{renderField('email', <FaEnvelope size={14} />, 'Business Email', 'email')}</div>
                        <div className="col-md-6">{renderField('phone', <FaPhone size={14} />, 'Phone Number', 'tel')}</div>
                      </div>
                      {renderField('companyWebsite', <FaGlobe size={14} />, 'Company Website (Optional)', 'url')}
                      {renderField('companyAddress', <FaMapMarkerAlt size={14} />, 'Company Address')}
                      <div className="mb-3">
                        <label style={labelStyle}>Industry</label>
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'industry' ? '#16a34a' : '#9ca3af', zIndex: 2 }}>
                            <FaIndustry size={14} />
                          </span>
                          <select
                            name="industry"
                            className={`form-select ${errors.industry ? 'is-invalid' : ''}`}
                            style={{ ...getFieldStyle('industry'), paddingLeft: '2.5rem' }}
                            value={formData.industry}
                            onChange={handleChange}
                            onFocus={() => setFocusedField('industry')}
                            onBlur={() => setFocusedField(null)}
                          >
                            <option value="">Select Industry</option>
                            {industries.map((ind) => (
                              <option key={ind} value={ind}>{ind}</option>
                            ))}
                          </select>
                           {errors.industry && <div className="invalid-feedback" style={{ fontSize: '0.78rem' }}>{errors.industry}</div>}
                        </div>
                      </div>
                      {renderField('businessRegistration', <FaBuilding size={14} />, 'Business Registration No. (Optional)')}
                    </div>
                  )}

                  {step === 1 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <h6 className="fw-bold mb-3" style={{ color: '#15803d', fontSize: '0.9rem' }}><FaShieldAlt className="me-2" />Account Security</h6>
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
                        <input type="checkbox" name="agreeTerms" className="form-check-input" id="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} style={{ accentColor: '#16a34a' }} />
                        <label className="form-check-label small ms-2" htmlFor="agreeTerms" style={{ color: '#64748b' }}>
                          I agree to the <a href="#terms" className="text-decoration-none fw-semibold" style={{ color: '#16a34a' }}>Terms</a> and <a href="#privacy" className="text-decoration-none fw-semibold" style={{ color: '#16a34a' }}>Privacy Policy</a>
                        </label>
                        {errors.agreeTerms && <div className="text-danger small mt-1" style={{ fontSize: '0.78rem' }}>{errors.agreeTerms}</div>}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                      <h6 className="fw-bold mb-3" style={{ color: '#15803d', fontSize: '0.9rem' }}><FaUser className="me-2" />Set Up Company Profile</h6>
                      <p className="text-muted small mb-4">Add your company logo and description to attract the best student talent.</p>

                      <div className="text-center mb-4">
                        <div
                          style={{
                            width: 110, height: 110, borderRadius: '50%', margin: '0 auto',
                            background: logoPreview ? 'none' : 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', position: 'relative', overflow: 'hidden',
                            border: '3px dashed #86efac',
                          }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div className="text-center">
                              <FaCamera size={24} color="#16a34a" />
                              <div style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 600, marginTop: 2 }}>Add Logo</div>
                            </div>
                          )}
                          <div
                            style={{
                              position: 'absolute', bottom: 0, left: 0, right: 0,
                              background: 'rgba(22, 163, 74, 0.85)', padding: '4px',
                              textAlign: 'center', fontSize: '0.65rem', color: '#fff', fontWeight: 600,
                            }}
                          >
                            <FaCamera size={10} className="me-1" />{logoPreview ? 'Change' : 'Upload'}
                          </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="d-none" onChange={handleLogoChange} />
                      </div>

                      <div className="mb-3">
                        <label style={labelStyle}>Company Description</label>
                        <textarea
                          className="form-control"
                          style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                          placeholder="Describe your company, what you do, and why students should work with you..."
                          value={profileData.companyDescription}
                          onChange={(e) => setProfileData((prev) => ({ ...prev, companyDescription: e.target.value }))}
                          maxLength={500}
                        />
                        <small className="text-muted">{profileData.companyDescription.length}/500</small>
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
                      <button type="button" className="btn rounded-3 px-4 fw-semibold" style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)', color: '#fff', border: 'none' }} onClick={handleNext} disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm" /> : <>{step === 1 ? <><FaCheck className="me-1" /> Create Account</> : <>Next <FaArrowRight className="ms-1" /></>}</>}
                      </button>
                    ) : (
                      <button type="button" className="btn rounded-3 px-4 fw-semibold" style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', border: 'none' }} onClick={handleSubmitProfile} disabled={loading}>
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
                  Already have an account? <Link to="/login/employer" className="text-decoration-none fw-semibold" style={{ color: '#16a34a' }}>Login</Link>
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

export default EmployerRegister;
