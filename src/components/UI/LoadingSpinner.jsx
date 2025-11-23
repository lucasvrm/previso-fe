import React from 'react';

/**
 * Reusable loading spinner component
 * @param {Object} props - Component props
 * @param {boolean} props.fullScreen - If true, centers spinner in full screen
 * @param {string} props.size - Size of the spinner: 'sm', 'md', 'lg' (default: 'md')
 */
const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const spinner = (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-600`} />
  );

  if (fullScreen) {
    return (
      <div className="flex justify-center items-center h-screen">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
