import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const LoadingSpinner = ({
  size = 'md',
  variant = 'primary',
  message = '',
  centered = false,
  fullScreen = false
}) => {
  const { t } = useTranslation();
  const displayMessage = message || t('loading');

  const spinner = (
    <div className={`d-flex align-items-center ${centered ? 'justify-content-center' : ''}`}>
      <Spinner
        animation="border"
        variant={variant}
        size={size}
        role="status"
        className={displayMessage ? 'me-2' : ''}
      >
        <span className="visually-hidden">{t('loading')}</span>
      </Spinner>
      {displayMessage && <span className="text-muted">{displayMessage}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999
      }}>
        <div className="text-center">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

// Inline loading spinner for buttons
export const ButtonSpinner = ({ variant = 'light', size = 'sm' }) => (
  <Spinner
    as="span"
    animation="border"
    size={size}
    variant={variant}
    role="status"
    aria-hidden="true"
    className="me-2"
  />
);

// Small inline spinner
export const SmallSpinner = () => {
  const { t } = useTranslation();
  return (
    <Spinner
      animation="border"
      size="sm"
      role="status"
      className="ms-2"
    >
      <span className="visually-hidden">{t('loading')}</span>
    </Spinner>
  );
};

export default LoadingSpinner;