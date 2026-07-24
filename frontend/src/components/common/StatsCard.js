import React from 'react';
import { Card } from 'react-bootstrap';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const colorMap = {
  primary: { border: '#0d6efd', bg: '#0d6efd20', text: '#0d6efd' },
  success: { border: '#198754', bg: '#19875420', text: '#198754' },
  danger: { border: '#dc3545', bg: '#dc354520', text: '#dc3545' },
  warning: { border: '#ffc107', bg: '#ffc10720', text: '#ffc107' },
  info: { border: '#0dcaf0', bg: '#0dcaf020', text: '#0dcaf0' },
};

const StatsCard = ({ title, value, icon: Icon, color = 'primary', change }) => {
  const colors = colorMap[color] || colorMap.primary;
  const isPositive = change >= 0;
  const absChange = Math.abs(change);

  return (
    <Card
      className="border-0 shadow-sm h-100"
      style={{ borderLeft: `4px solid ${colors.border}` }}
    >
      <Card.Body className="d-flex align-items-center justify-content-between p-3">
        <div>
          <p className="text-secondary small mb-1 text-uppercase fw-semibold" style={{ fontSize: '0.75rem' }}>
            {title}
          </p>
          <h4 className="fw-bold mb-0">{value}</h4>
          {change !== undefined && change !== null && (
            <div className="d-flex align-items-center mt-1">
              {isPositive ? (
                <FiTrendingUp className="text-success me-1" size={14} />
              ) : (
                <FiTrendingDown className="text-danger me-1" size={14} />
              )}
              <span
                className={`small fw-semibold ${isPositive ? 'text-success' : 'text-danger'}`}
              >
                {isPositive ? '+' : '-'}{absChange}%
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 48, height: 48, backgroundColor: colors.bg }}
          >
            <Icon size={24} style={{ color: colors.text }} />
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default StatsCard;
