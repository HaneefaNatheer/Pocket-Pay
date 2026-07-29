import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Email is invalid';
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
      await login(formData.email, formData.password, 'admin');
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid admin credentials.';
      toast.error(msg);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-lg border-0 rounded-4" style={{ background: 'rgba(255,255,255,0.95)' }}>
              <div className="card-body p-4 p-md-5">
                <div className="text-center mb-4">
                  <div className="bg-dark text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                    <FaShieldAlt size={28} />
                  </div>
                  <h3 className="fw-bold text-dark">Admin Panel</h3>
                  <p className="text-muted small">Restricted access. Authorized personnel only.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-end-0 text-white"><FaEnvelope /></span>
                      <input
                        type="email"
                        name="email"
                        className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="admin@platform.com"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-end-0 text-white"><FaLock /></span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Enter admin password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button type="button" className="input-group-text bg-dark border-start-0 text-white" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-dark w-100 py-2 fw-semibold rounded-3" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Authenticating...
                      </>
                    ) : 'Access Admin Panel'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
