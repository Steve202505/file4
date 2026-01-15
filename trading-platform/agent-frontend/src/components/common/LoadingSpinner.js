import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({
  size = 'md',
  message,
  fullScreen = false,
  variant = 'primary'
}) => {
  const { t } = useTranslation();
  const displayMessage = message || t('loading_dots');
  const spinner = (
    <div className={`d-flex flex-column align-items-center justify-content-center ${fullScreen ? 'loading-overlay' : 'py-5'}`}>
      <Spinner
        animation="border"
        role="status"
        variant={variant}
        size={size}
      >
        <span className="visually-hidden">{displayMessage}</span>
      </Spinner>
      {displayMessage && (
        <p className="mt-2 text-muted">{displayMessage}</p>
      )}
    </div>
  );

  return spinner;
};

export const InlineSpinner = ({ size = 'sm', variant = 'primary' }) => (
  <Spinner
    animation="border"
    size={size}
    variant={variant}
    className="me-2"
  />
);

export default LoadingSpinner;