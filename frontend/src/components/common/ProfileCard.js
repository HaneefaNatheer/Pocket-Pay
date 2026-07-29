import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FiEdit2, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const roleBadgeColors = {
  student: 'primary',
  employer: 'success',
  admin: 'danger',
};

const ProfileCard = ({ user, profile, role }) => {
  if (!user) return null;

  const displayRole = role || user.role || 'student';
  const badgeColor = roleBadgeColors[displayRole] || 'secondary';

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const profileData = profile || {};

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="text-center p-4">
        <div className="mb-3">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.name}
              className="rounded-circle"
              style={{ width: 96, height: 96, objectFit: 'cover' }}
            />
          ) : (
            <div
              className="rounded-circle mx-auto d-flex align-items-center justify-content-center bg-primary text-white fw-bold"
              style={{ width: 96, height: 96, fontSize: '2rem' }}
            >
              {getInitials(user.name)}
            </div>
          )}
        </div>

        <h5 className="fw-bold mb-1">{user.name}</h5>
        <p className="text-secondary small mb-2">{user.email}</p>
        <Badge bg={badgeColor} className="text-capitalize px-3 py-2 mb-3">
          {displayRole}
        </Badge>

        {displayRole === 'student' && (
          <div className="text-start mt-3 pt-3 border-top">
            {profileData.university && (
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">University</span>
                <span className="fw-semibold small">{profileData.university}</span>
              </div>
            )}
            {profileData.degree && (
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">Degree</span>
                <span className="fw-semibold small">{profileData.degree}</span>
              </div>
            )}
            {profileData.year && (
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">Year</span>
                <span className="fw-semibold small">{profileData.year}</span>
              </div>
            )}
          </div>
        )}

        {displayRole === 'employer' && (
          <div className="text-start mt-3 pt-3 border-top">
            {profileData.companyName && (
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">Company</span>
                <span className="fw-semibold small">{profileData.companyName}</span>
              </div>
            )}
            {profileData.industry && (
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">Industry</span>
                <span className="fw-semibold small">{profileData.industry}</span>
              </div>
            )}
            {profileData.verified && (
              <div className="d-flex justify-content-center mb-2">
                <FiCheckCircle className="text-success me-1" />
                <span className="text-success fw-semibold small">Verified Employer</span>
              </div>
            )}
          </div>
        )}

        <Link
          to={`/${displayRole}/profile`}
          className="btn btn-outline-primary btn-sm mt-3"
        >
          <FiEdit2 className="me-1" /> Edit Profile
        </Link>
      </Card.Body>
    </Card>
  );
};

export default ProfileCard;
