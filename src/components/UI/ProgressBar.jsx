import React from 'react';
import './ProgressBar.css';
import { clampProbability } from '../../utils/probability';

/**
 * ProgressBar component for displaying probability values
 * @param {Object} props
 * @param {number} props.value - Value between 0 and 1 (e.g., 0.75 for 75%)
 * @param {string} [props.height='16px'] - Height of the progress bar
 * @param {string} [props.color='#0b84ff'] - Color of the filled portion
 * @param {string} [props.trackColor='#e6eef5'] - Color of the track/background
 * @param {string} [props.backgroundColor='#e6eef5'] - Alias for trackColor (backwards compatibility)
 * @param {boolean} [props.showPercentage=true] - Whether to show percentage text
 * @param {string} [props.ariaLabel] - Custom ARIA label for the progress bar
 * @returns {JSX.Element}
 */
const ProgressBar = ({ 
  value = 0, 
  height = '16px', 
  color = '#0b84ff', 
  trackColor,
  backgroundColor = '#e6eef5',
  showPercentage = true,
  ariaLabel
}) => {
  // Use clampProbability to ensure value is between 0 and 1
  const clamp = clampProbability(value);
  const pct = Math.round(clamp * 100);
  const bgColor = trackColor || backgroundColor;

  return (
    <div className="w-full">
      <div 
        className="progress-track rounded-full overflow-hidden"
        style={{ 
          backgroundColor: bgColor, 
          height: height 
        }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || `${pct} percent`}
      >
        <div 
          className="progress-fill h-full rounded-full"
          style={{ 
            width: `${pct}%`, 
            backgroundColor: color,
            height: height,
            transition: 'width 300ms ease'
          }}
        />
      </div>
      {showPercentage && (
        <p className="text-right text-sm font-semibold mt-1">
          {pct}% de probabilidade
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
