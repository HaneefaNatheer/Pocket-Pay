import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaUserGraduate, FaBuilding, FaCheckCircle, FaWallet, FaBriefcase, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import loginVisual from '../../assets/images/pocket-pay-log in image.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Enter a valid email';
    if (!formData.password) errs.password = 'Password is required';
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
      const res = await login(formData.email, formData.password);
      const role = res.data?.user?.role || res.data?.role;
      if (role === 'employer') navigate('/employer/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-cover">
      {/* LEFT: Full-page cover image */}
      <div className="login-cover-left d-none d-lg-flex">
        <img src={loginVisual} alt="Pocket-Pay jobs for students" className="login-cover-bg" />
        <div className="login-overlay" />

        <div className="login-cover-content">
          <div>
            <span className="login-brand-badge">Pocket-Pay</span>
          </div>

          <div>
            <h3 className="login-visual-title">Earn While You Study</h3>
            <p className="login-visual-text">
              Daily wage, part-time and freelance jobs from trusted employers near you.
            </p>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <span className="login-feature"><FaCheckCircle size={12} /> Verified Employers</span>
              <span className="login-feature"><FaCheckCircle size={12} /> Instant Apply</span>
              <span className="login-feature"><FaCheckCircle size={12} /> Quick Pay</span>
            </div>
          </div>

          <div className="login-floats">
            <div className="login-float-badge" style={{ animationDelay: '0s' }}>
              <FaBriefcase className="text-white" size={18} />
              <div>
                <div className="fw-bold" style={{ fontSize: '0.95rem', lineHeight: 1.1 }}>500+ Jobs</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Posted by employers</div>
              </div>
            </div>
            <div className="login-float-badge" style={{ animationDelay: '1.6s' }}>
              <FaWallet className="text-white" size={18} />
              <div>
                <div className="fw-bold" style={{ fontSize: '0.95rem', lineHeight: 1.1 }}>Earn Daily</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Flexible schedules</div>
              </div>
            </div>
            <div className="login-float-badge" style={{ animationDelay: '3.2s' }}>
              <FaShieldAlt className="text-white" size={18} />
              <div>
                <div className="fw-bold" style={{ fontSize: '0.95rem', lineHeight: 1.1 }}>100% Trusted</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.8 }}>Verified platform</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Login form */}
      <div className="login-cover-right">
        <div className="login-cover-form">
          <div className="text-center mb-4">
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', color: '#fff', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
              <FaSignInAlt size={26} />
            </div>
            <h4 className="fw-bold mb-1" style={{ color: '#1f2937' }}>Welcome Back</h4>
            <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>Sign in to your Pocket-Pay account</p>
          </div>

          {errors.general && (
            <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: errors.email ? '#ef4444' : '#9ca3af', zIndex: 2 }}>
                  <FaEnvelope size={14} />
                </span>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  style={{ borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', padding: '0.75rem 0.75rem 0.75rem 2.6rem', fontSize: '0.9rem' }}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <div className="invalid-feedback" style={{ fontSize: '0.78rem' }}>{errors.email}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: errors.password ? '#ef4444' : '#9ca3af', zIndex: 2 }}>
                  <FaLock size={14} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  style={{ borderRadius: '0.75rem', border: '1.5px solid #e2e8f0', padding: '0.75rem 2.6rem 0.75rem 2.6rem', fontSize: '0.9rem' }}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button type="button" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', zIndex: 2 }} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
                {errors.password && <div className="invalid-feedback" style={{ fontSize: '0.78rem' }}>{errors.password}</div>}
              </div>
            </div>

            <div className="d-flex justify-content-end mb-3">
              <Link to="/forgot-password" className="small text-decoration-none fw-semibold" style={{ color: '#7c3aed' }}>Forgot Password?</Link>
            </div>

            <button type="submit" className="btn w-100 py-2.5 fw-semibold rounded-3" style={{ background: 'linear-gradient(135deg, #5b21b6, #7c3aed)', color: '#fff', border: 'none', paddingTop: '0.8rem', paddingBottom: '0.8rem' }} disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" role="status" />Signing in...</>
              ) : (
                <><FaSignInAlt className="me-2" />Sign In</>
              )}
            </button>
          </form>

          <hr className="my-4" />

          <div className="text-center">
            <p className="small text-muted mb-3">Don't have an account?</p>
            <div className="d-flex gap-2 justify-content-center">
              <Link to="/register/student" className="btn btn-sm rounded-3 px-3 py-2 fw-semibold" style={{ background: '#eef2ff', color: '#5b21b6', border: '1.5px solid #c7d2fe' }}>
                <FaUserGraduate className="me-1" /> Student
              </Link>
              <Link to="/register/employer" className="btn btn-sm rounded-3 px-3 py-2 fw-semibold" style={{ background: '#ecfdf5', color: '#16a34a', border: '1.5px solid #bbf7d0' }}>
                <FaBuilding className="me-1" /> Employer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
