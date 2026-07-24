import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaExclamationTriangle, FaEnvelope, FaRedo } from 'react-icons/fa';
import { authService } from '../../services/authService';

const VerifyEmail = () => {
  const { token } = useParams();

  const [status, setStatus] = useState('loading');
  const [resending, setResending] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) { setStatus('error'); return; }
      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim() || !/\S+@\S+\.\S+/.test(resendEmail)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setResending(true);
    try {
      await authService.forgotPassword(resendEmail);
      toast.success('Verification email sent! Check your inbox.');
      setShowResend(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5 col-lg-4">
              <div className="card shadow-lg border-0 rounded-4 text-center p-5">
                <div className="spinner-border text-primary mx-auto mb-3" style={{ width: 50, height: 50 }} role="status" />
                <h4 className="fw-bold text-dark">Verifying Your Email</h4>
                <p className="text-muted small">Please wait while we verify your email address...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5 col-lg-4">
              <div className="card shadow-lg border-0 rounded-4 text-center p-5">
                <div className="bg-success bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 70, height: 70 }}>
                  <FaCheckCircle size={35} />
                </div>
                <h3 className="fw-bold text-success">Email Verified!</h3>
                <p className="text-muted mb-4">
                  Your email has been successfully verified. You can now access your account.
                </p>
                <Link to="/login" className="btn btn-primary rounded-3 px-4 py-2 fw-semibold">
                  Go to Login
                </Link>
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
            <div className="card shadow-lg border-0 rounded-4 text-center p-5">
              <div className="bg-danger bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: 70, height: 70 }}>
                <FaExclamationTriangle size={30} />
              </div>
              <h3 className="fw-bold text-danger">Verification Failed</h3>
              <p className="text-muted mb-4">
                This verification link is invalid or has expired. You can request a new verification email below.
              </p>

              {!showResend ? (
                <button
                  className="btn btn-outline-primary rounded-3 px-4 fw-semibold"
                  onClick={() => setShowResend(true)}
                >
                  <FaRedo className="me-2" /> Resend Verification Email
                </button>
              ) : (
                <form onSubmit={handleResend}>
                  <div className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><FaEnvelope className="text-muted" /></span>
                      <input
                        type="email"
                        className="form-control border-start-0"
                        placeholder="Enter your email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary rounded-3 px-4 fw-semibold" disabled={resending}>
                    {resending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaRedo className="me-2" /> Send Verification Email
                      </>
                    )}
                  </button>
                </form>
              )}

              <hr className="my-4" />
              <Link to="/login" className="small text-decoration-none fw-semibold text-muted">Back to Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
