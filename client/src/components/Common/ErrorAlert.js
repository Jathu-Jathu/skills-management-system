import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorAlert = ({ message, onRetry, onClose }) => {
  return (
    <div className="error-alert">
      <div className="error-icon">
        <FaExclamationTriangle />
      </div>
      <div className="error-content">
        <h4>Something went wrong</h4>
        <p>{message}</p>
        <div className="error-actions">
          {onRetry && (
            <button onClick={onRetry} className="btn btn-primary">
              Try Again
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="btn btn-secondary">
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;


