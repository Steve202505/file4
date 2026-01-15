import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ErrorBoundary = ({ children }) => {
    const { t } = useTranslation();
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState(null);
    const [errorInfo, setErrorInfo] = useState(null);

    useEffect(() => {
        const errorHandler = (error, errorInfo) => {
            console.error("Uncaught error:", error, errorInfo);
            setHasError(true);
            setError(error);
            setErrorInfo(errorInfo);
        };

        window.addEventListener('error', errorHandler);
        return () => window.removeEventListener('error', errorHandler);
    }, []);

    if (hasError) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
                <h2>{t('err_something_wrong', 'Something went wrong.')}</h2>
                <p>{t('err_apologize', 'We apologize for the inconvenience. Please try refreshing the page.')}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#409EFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    {t('refresh_page', 'Refresh Page')}
                </button>

                {process.env.NODE_ENV === 'development' && error && (
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px', textAlign: 'left' }}>
                        {error && error.toString()}
                        <br />
                        {errorInfo && errorInfo.componentStack}
                    </details>
                )}
            </div>
        );
    }

    return children;
};

export default ErrorBoundary;
