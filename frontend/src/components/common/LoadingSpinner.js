import React from 'react';

const LoadingSpinner = ({ size = 'sm', message = '', fullPage = false }) => {
  const spinnerSize = size === 'lg' ? 'spinner-border' : 'spinner-border';

  const spinner = (
    <div className={`text-center ${fullPage ? 'd-flex flex-column justify-content-center align-items-center' : 'py-4'}`}
      style={fullPage ? { minHeight: '60vh' } : {}}
    >
      <div
        className={`${spinnerSize} text-primary ${size === 'lg' ? 'border-4' : 'border-3'}`}
        role="status"
        style={size === 'lg' ? { width: '3rem', height: '3rem' } : {}}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && (
        <p className={`mt-3 text-secondary ${size === 'lg' ? 'fs-6' : 'small'}`}>
          {message}
        </p>
      )}
    </div>
  );

  return spinner;
};

export default LoadingSpinner;
