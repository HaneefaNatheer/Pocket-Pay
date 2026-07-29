import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const validate = () => {
    if (!email.trim()) { setError('Email is required'); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Email is invalid'); return false; }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset link. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5 col-lg-4">
              <div className="card shadow-lg border-0 rounded-4 text-center p-5">
                <div className="bg-success bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 70, height: 70 }}>
                  <FaPaperPlane size={30} />
                </div>
                <h3 className="fw-bold">Email Sent!</h3>
                <p className="text-muted mb-4">
                  We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the instructions.
                </p>
                <Link to="/login" className="btn btn-primary rounded-3 px-4">Back to Login</Link>
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
                  <div className="bg-warning bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                    <FaEnvelope size={28} />
                  </div>
                  <h3 className="fw-bold text-dark">Forgot Password?</h3>
                  <p className="text-muted small">Enter your email and we'll send you a reset link.</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><FaEnvelope className="text-muted" /></span>
                      <input
                        type="email"
                        className={`form-control border-start-0 ${error ? 'is-invalid' : ''}`}
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      />
                      {error && <div className="invalid-feedback">{error}</div>}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold rounded-3" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Sending...
                      </>
                    ) : 'Send Reset Link'}
                  </button>
                </form>

                <hr className="my-4" />

                <div className="text-center">
                  <Link to="/login" className="small text-decoration-none fw-semibold text-muted">
                    <FaArrowLeft className="me-1" /> Back to Login
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

export default ForgotPassword;
