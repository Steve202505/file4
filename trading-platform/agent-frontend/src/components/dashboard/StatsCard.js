import React from 'react';
import { Card } from 'react-bootstrap';

const StatsCard = ({
  title,
  value,
  icon,
  color = 'gold',
  change,
  changeType = 'neutral',
  subtitle,
  onClick
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase': return 'text-success';
      case 'decrease': return 'text-danger';
      default: return 'text-muted';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase': return 'bi-arrow-up';
      case 'decrease': return 'bi-arrow-down';
      default: return 'bi-dash';
    }
  };

  return (
    <Card
      className={`glass-card border-0 shadow-lg cursor-pointer transition-all ${onClick ? 'hover-shadow' : ''}`}
      onClick={onClick}
      style={{ overflow: 'hidden' }}
    >
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="p-2 rounded-circle glass-effect" style={{ border: '1px solid var(--glass-border)', background: 'rgba(212, 175, 55, 0.05)' }}>
            <i className={`bi ${icon} text-gold fs-4 px-2`}></i>
          </div>
          {change && (
            <div className={`px-2 py-1 rounded-pill small ${getChangeColor()} bg-dark bg-opacity-50`} style={{ fontSize: '0.7rem' }}>
              <i className={`bi ${getChangeIcon()} me-1`}></i>
              {change}
            </div>
          )}
        </div>
        <div>
          <h6 className="text-secondary mb-2 small text-uppercase fw-bold" style={{ letterSpacing: '0.5px' }}>{title}</h6>
          <h2 className="mb-0 text-white fw-bold">{value}</h2>
          {subtitle && (
            <p className="text-muted mb-0 mt-2 small">{subtitle}</p>
          )}
        </div>
      </Card.Body>
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '60px',
        height: '60px',
        background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)',
        zIndex: 0
      }}></div>
    </Card>
  );
};

export default StatsCard;