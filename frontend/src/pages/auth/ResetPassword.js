import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaLock, FaEye, FaEyeSlash, FaKey, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { authService } from '../../services/authService';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [invalidToken, setInvalidToken] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.resetPassword(token, formData.password);
      toast.success('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 404) {
        setInvalidToken(true);
      } else {
        toast.error(err.response?.data?.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (invalidToken) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5 col-lg-4">
              <div className="card shadow-lg border-0 rounded-4 text-center p-5">
                <div className="bg-danger bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 70, height: 70 }}>
                  <FaExclamationTriangle size={30} />
                </div>
                <h3 className="fw-bold">Invalid or Expired Link</h3>
                <p className="text-muted mb-4">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <Link to="/forgot-password" className="btn btn-primary rounded-3 px-4">Request New Link</Link>
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
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="bg-primary bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                    <FaKey size={28} />
                  </div>
                  <h3 className="fw-bold text-dark">Reset Password</h3>
                  <p className="text-muted small">Enter your new password below.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">New Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><FaLock className="text-muted" /></span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Min 8 characters"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button type="button" className="input-group-text bg-light border-start-0" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                      </button>
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Confirm New Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><FaLock className="text-muted" /></span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className={`form-control border-start-0 border-end-0 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        placeholder="Re-enter new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button type="button" className="input-group-text bg-light border-start-0" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <FaEyeSlash className="text-muted" /> : <FaEye className="text-muted" />}
                      </button>
                      {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold rounded-3" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Resetting...
                      </>
                    ) : 'Reset Password'}
                  </button>
                </form>

                <hr className="my-4" />

                <div className="text-center">
                  <Link to="/login" className="small text-decoration-none fw-semibold text-muted">
                    <FaCheckCircle className="me-1" /> Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
