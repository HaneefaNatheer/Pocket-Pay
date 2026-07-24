import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBuilding, FaIndustry, FaGlobe, FaPhone, FaMapMarkerAlt, FaUserTie } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const EmployerRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    companyName: '', industry: '', companyWebsite: '', companyPhone: '',
    companyAddress: '', agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [registered, setRegistered] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Email is invalid';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!formData.companyName.trim()) errs.companyName = 'Company name is required';
    if (!formData.industry.trim()) errs.industry = 'Industry is required';
    if (!formData.agreeTerms) errs.agreeTerms = 'You must agree to the terms and conditions';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { agreeTerms, ...submitData } = formData;
      await register({ ...submitData, role: 'employer' });
      setRegistered(true);
      toast.success('Registration successful! Check your email to verify your account.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0 rounded-4 text-center p-5">
                <div className="bg-success bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 70, height: 70 }}>
                  <FaEnvelope size={30} />
                </div>
                <h3 className="fw-bold">Check Your Email</h3>
                <p className="text-muted mb-4">
                  We've sent a verification link to <strong>{formData.email}</strong>. Please check your inbox and click the link to activate your account.
                </p>
                <Link to="/login/employer" className="btn btn-success rounded-3 px-4">Go to Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="bg-success bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                    <FaUserTie size={28} />
                  </div>
                  <h3 className="fw-bold text-dark">Employer Registration</h3>
                  <p className="text-muted small">Register your company and start hiring.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Full Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaUser className="text-muted" /></span>
                        <input type="text" name="fullName" className={`form-control ${errors.fullName ? 'is-invalid' : ''}`} placeholder="Jane Smith" value={formData.fullName} onChange={handleChange} />
                        {errors.fullName && <div className="invalid-feedback">{errors.fullName}</div>}
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Email</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaEnvelope className="text-muted" /></span>
                        <input type="email" name="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="hr@company.com" value={formData.email} onChange={handleChange} />
                        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaLock className="text-muted" /></span>
                        <input type={showPassword ? 'text' : 'password'} name="password" className={`form-control border-end-0 ${errors.password ? 'is-invalid' : ''}`} placeholder="Min 8 characters" value={formData.password} onChange={handleChange} />
                        <button type="button" className="input-group-text bg-light" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                        </button>
                        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Confirm Password</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaLock className="text-muted" /></span>
                        <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" className={`form-control border-end-0 ${errors.confirmPassword ? 'is-invalid' : ''}`} placeholder="Re-enter password" value={formData.confirmPassword} onChange={handleChange} />
                        <button type="button" className="input-group-text bg-light" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                        </button>
                        {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                      </div>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">Company Name</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaBuilding className="text-muted" /></span>
                        <input type="text" name="companyName" className={`form-control ${errors.companyName ? 'is-invalid' : ''}`} placeholder="Acme Corp" value={formData.companyName} onChange={handleChange} />
                        {errors.companyName && <div className="invalid-feedback">{errors.companyName}</div>}
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Industry</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaIndustry className="text-muted" /></span>
                        <input type="text" name="industry" className={`form-control ${errors.industry ? 'is-invalid' : ''}`} placeholder="Technology" value={formData.industry} onChange={handleChange} />
                        {errors.industry && <div className="invalid-feedback">{errors.industry}</div>}
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Company Website</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaGlobe className="text-muted" /></span>
                        <input type="url" name="companyWebsite" className="form-control" placeholder="https://company.com" value={formData.companyWebsite} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Company Phone</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaPhone className="text-muted" /></span>
                        <input type="tel" name="companyPhone" className="form-control" placeholder="+1 234 567 890" value={formData.companyPhone} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Company Address</label>
                      <div className="input-group">
                        <span className="input-group-text bg-light"><FaMapMarkerAlt className="text-muted" /></span>
                        <input type="text" name="companyAddress" className="form-control" placeholder="123 Business St, City" value={formData.companyAddress} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input type="checkbox" name="agreeTerms" className={`form-check-input ${errors.agreeTerms ? 'is-invalid' : ''}`} id="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} />
                      <label className="form-check-label small text-muted" htmlFor="agreeTerms">
                        I agree to the <a href="#terms" className="text-decoration-none">Terms and Conditions</a> and <a href="#privacy" className="text-decoration-none">Privacy Policy</a>
                      </label>
                      {errors.agreeTerms && <div className="invalid-feedback">{errors.agreeTerms}</div>}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-success w-100 py-2 fw-semibold rounded-3" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Creating Account...
                      </>
                    ) : 'Create Employer Account'}
                  </button>
                </form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="small text-muted mb-0">
                    Already have an account? <Link to="/login/employer" className="text-decoration-none fw-semibold">Login</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerRegister;
