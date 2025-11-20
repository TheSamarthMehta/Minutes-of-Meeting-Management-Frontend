import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  const containerClasses = fullScreen 
    ? 'min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-4 border-blue-600 dark:border-blue-400 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
