import React from 'react';

/**
 * ProgressBar component for displaying probability values
 * @param {Object} props
 * @param {number} props.value - Value between 0 and 1 (e.g., 0.75 for 75%)
 * @param {string} [props.height='16px'] - Height of the progress bar
 * @param {string} [props.color='#0b84ff'] - Color of the filled portion
 * @param {string} [props.backgroundColor='#e6eef5'] - Color of the track/background
 * @param {boolean} [props.showPercentage=true] - Whether to show percentage text
 * @returns {JSX.Element}
 */
const ProgressBar = ({ 
  value = 0, 
  height = '16px', 
  color = '#0b84ff', 
  backgroundColor = '#e6eef5',
  showPercentage = true 
}) => {
  // Ensure value is between 0 and 1
  const normalizedValue = Math.max(0, Math.min(1, value));
  const percentage = Math.round(normalizedValue * 100);

  return (
    <div className="w-full">
      <div 
        className="progress-track rounded-full overflow-hidden"
        style={{ 
          backgroundColor: backgroundColor, 
          height: height 
        }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${percentage} percent`}
      >
        <div 
          className="progress-fill h-full rounded-full transition-all duration-300 ease-in-out"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color,
            height: height 
          }}
        />
      </div>
      {showPercentage && (
        <p className="text-right text-sm font-semibold mt-1">
          {percentage}% de probabilidade
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
