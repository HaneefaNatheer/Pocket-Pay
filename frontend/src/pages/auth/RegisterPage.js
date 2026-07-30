import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaBuilding, FaArrowRight } from 'react-icons/fa';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const options = [
    {
      icon: FaGraduationCap,
      title: 'Student',
      description: 'Looking for part-time jobs, internships, or freelance opportunities.',
      button: 'Register as Student',
      path: '/register/student',
      color: '#7c3aed',
      bgLight: '#eef2ff',
    },
    {
      icon: FaBuilding,
      title: 'Employer',
      description: 'Looking for talented university students to hire.',
      button: 'Register as Employer',
      path: '/register/employer',
      color: '#10b981',
      bgLight: '#ecfdf5',
    },
  ];

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f5e9 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <h2 className="fw-bold text-dark fade-in-down" style={{ fontSize: '2.5rem' }}>Create an Account</h2>
              <p className="text-muted mt-3 fade-in-down" style={{ fontSize: '1.1rem', animationDelay: '0.15s' }}>Choose how you want to use Pocket-Pay</p>
            </div>

            <div className="row g-4 justify-content-center">
              {options.map((opt, i) => (
                <div key={opt.title} className="col-md-5 fade-in-up" style={{ animationDelay: `${0.3 + i * 0.2}s` }}>
                  <div
                    className="card border-0 h-100 rounded-4 text-center role-card"
                    style={{ cursor: 'pointer', '--card-shadow-color': `${opt.color}30` }}
                    onClick={() => navigate(opt.path)}
                  >
                    <div className="card-body py-5 px-4 d-flex flex-column align-items-center justify-content-between">
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                        style={{ width: 80, height: 80, backgroundColor: opt.bgLight }}
                      >
                        <opt.icon size={36} color={opt.color} />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-2">{opt.title}</h4>
                        <p className="text-muted mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                          {opt.description}
                        </p>
                      </div>
                      <button
                        className="btn fw-semibold rounded-3 px-4 py-2 d-inline-flex align-items-center mt-auto"
                        style={{ backgroundColor: opt.color, color: '#fff' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(opt.path);
                        }}
                      >
                        {opt.button}
                        <FaArrowRight className="ms-2" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-5 fade-in-up" style={{ animationDelay: '0.8s' }}>
              <p className="small text-muted mb-0">
                Already have an account? <a href="/login" className="text-decoration-none fw-semibold">Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
