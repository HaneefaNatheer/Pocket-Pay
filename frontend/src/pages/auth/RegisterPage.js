import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaBuilding, FaArrowRight } from 'react-icons/fa';

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
              <h2 className="fw-bold text-dark" style={{ fontSize: '2.5rem' }}>Create an Account</h2>
              <p className="text-muted mt-3" style={{ fontSize: '1.1rem' }}>Choose how you want to use Pocket-Pay</p>
            </div>

            <div className="row g-4 justify-content-center">
              {options.map((opt) => (
                <div key={opt.title} className="col-md-5">
                  <div
                    className="card border-0 shadow-lg h-100 rounded-4 text-center p-4"
                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onClick={() => navigate(opt.path)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = `0 20px 40px ${opt.color}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                    }}
                  >
                    <div className="card-body py-5 px-4">
                      <div
                        className="rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                        style={{ width: 80, height: 80, backgroundColor: opt.bgLight }}
                      >
                        <opt.icon size={36} color={opt.color} />
                      </div>
                      <h4 className="fw-bold mb-2">{opt.title}</h4>
                      <p className="text-muted mb-4" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                        {opt.description}
                      </p>
                      <button
                        className="btn fw-semibold rounded-3 px-4 py-2 d-inline-flex align-items-center"
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

            <div className="text-center mt-5">
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
