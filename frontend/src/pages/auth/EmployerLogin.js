import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaBuilding } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const EmployerLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Email is invalid';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
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
      await login(formData.email, formData.password, 'employer');
      toast.success('Login successful!');
      navigate('/employer/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="bg-success bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                    <FaBuilding size={28} />
                  </div>
                  <h3 className="fw-bold text-dark">Employer Login</h3>
                  <p className="text-muted small">Access your employer dashboard.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><FaEnvelope className="text-muted" /></span>
                      <input
                        type="email"
                        name="email"
                        className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="employer@company.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><FaLock className="text-muted" /></span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button type="button" className="input-group-text bg-light border-start-0" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                      </button>
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        className="form-check-input"
                        id="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                      <label className="form-check-label small text-muted" htmlFor="rememberMe">Remember me</label>
                    </div>
                    <Link to="/forgot-password" className="small text-decoration-none">Forgot Password?</Link>
                  </div>

                  <button type="submit" className="btn btn-success w-100 py-2 fw-semibold rounded-3" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Signing in...
                      </>
                    ) : 'Sign In'}
                  </button>
                </form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="small text-muted mb-2">
                    Don't have an account? <Link to="/register/employer" className="text-decoration-none fw-semibold">Register as Employer</Link>
                  </p>
                  <p className="small text-muted mb-0">
                    Are you a student? <Link to="/login" className="text-decoration-none fw-semibold">Student Login</Link>
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

export default EmployerLogin;
