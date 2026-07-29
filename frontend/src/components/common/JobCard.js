import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Badge, Button } from 'react-bootstrap';
import { FiMapPin, FiDollarSign, FiHeart, FiCalendar } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

const categoryColors = {
  technology: 'primary',
  engineering: 'info',
  design: 'success',
  marketing: 'warning',
  finance: 'danger',
  education: 'secondary',
  healthcare: 'danger',
  sales: 'warning',
  'human resources': 'secondary',
  operations: 'info',
};

const JobCard = ({ job, onSave, onUnsave, isSaved = false }) => {
  const navigate = useNavigate();

  if (!job) return null;

  const {
    _id,
    title,
    company,
    companyLogo,
    location,
    salary,
    category,
    skills = [],
    deadline,
  } = job;

  const companyInitials = company
    ? company.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const badgeColor = categoryColors[category?.toLowerCase()] || 'secondary';

  const formatSalary = (sal) => {
    if (!sal) return null;
    if (typeof sal === 'string') return sal;
    if (sal.min && sal.max) {
      return `$${sal.min.toLocaleString()} - $${sal.max.toLocaleString()}`;
    }
    if (sal.min) return `From $${sal.min.toLocaleString()}`;
    if (sal.max) return `Up to $${sal.max.toLocaleString()}`;
    return null;
  };

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (isSaved) {
      onUnsave?.(_id);
    } else {
      onSave?.(_id);
    }
  };

  return (
    <Card
      className="job-card h-100 border-0 shadow-sm"
      style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 0.5rem 1rem rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 0.125rem 0.25rem rgba(0,0,0,0.075)';
      }}
    >
      <Card.Body className="d-flex flex-column">
        <div className="d-flex align-items-start mb-3">
          {companyLogo ? (
            <img
              src={companyLogo}
              alt={`${company} logo`}
              className="rounded me-3 flex-shrink-0"
              style={{ width: 48, height: 48, objectFit: 'contain' }}
            />
          ) : (
            <div
              className="rounded me-3 flex-shrink-0 d-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary fw-bold"
              style={{ width: 48, height: 48, fontSize: '0.85rem' }}
            >
              {companyInitials}
            </div>
          )}
          <div className="flex-grow-1 overflow-hidden">
            <h6 className="fw-bold mb-1 text-truncate">{title}</h6>
            <span className="text-secondary small">{company}</span>
          </div>
          <Button
            variant="link"
            className="p-1 flex-shrink-0"
            onClick={handleSaveClick}
            title={isSaved ? 'Unsave job' : 'Save job'}
          >
            {isSaved ? (
              <FaHeart className="text-danger" size={18} />
            ) : (
              <FiHeart className="text-muted" size={18} />
            )}
          </Button>
        </div>

        <div className="mb-2">
          {location && (
            <span className="text-secondary small me-3">
              <FiMapPin className="me-1" />
              {location}
            </span>
          )}
          {salary && formatSalary(salary) && (
            <span className="text-secondary small">
              <FiDollarSign className="me-1" />
              {formatSalary(salary)}
            </span>
          )}
        </div>

        {category && (
          <div className="mb-2">
            <Badge bg={badgeColor} className="text-capitalize">
              {category}
            </Badge>
          </div>
        )}

        {skills.length > 0 && (
          <div className="mb-2 d-flex flex-wrap gap-1">
            {skills.slice(0, 5).map((skill, idx) => (
              <Badge key={idx} bg="light" text="dark" className="small fw-normal">
                {skill}
              </Badge>
            ))}
            {skills.length > 5 && (
              <Badge bg="light" text="muted">
                +{skills.length - 5}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-auto d-flex align-items-center justify-content-between pt-2 border-top">
          {deadline && (
            <span className="text-muted small">
              <FiCalendar className="me-1" />
              {formatDate(deadline)}
            </span>
          )}
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => navigate(`/jobs/${_id}`)}
          >
            View Details
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default JobCard;
