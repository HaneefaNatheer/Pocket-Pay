import React from 'react';
import { Button } from 'react-bootstrap';

const EmptyState = ({
  icon: Icon,
  title = 'Nothing here yet',
  message = '',
  actionText = '',
  onAction,
}) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 px-3 text-center">
      {Icon && (
        <div className="mb-3">
          <Icon size={48} className="text-muted" />
        </div>
      )}
      {title && (
        <h5 className="fw-bold text-secondary mb-2">{title}</h5>
      )}
      {message && (
        <p className="text-muted mb-4" style={{ maxWidth: 400 }}>
          {message}
        </p>
      )}
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
