import React from 'react';
import { FaSpinner } from 'react-icons/fa';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  }[size];
  
  return (
    <div className="loading-spinner">
      <FaSpinner className={`spinner ${sizeClass}`} />
      <p>{text}</p>
    </div>
  );
};

export default LoadingSpinner;


