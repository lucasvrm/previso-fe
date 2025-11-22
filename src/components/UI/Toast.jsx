// src/components/UI/Toast.jsx
// Simple Toast notification component for user feedback

import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

/**
 * Toast component for displaying temporary notifications
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {string} props.type - Type of toast: 'success' or 'error'
 * @param {Function} props.onClose - Callback when toast is closed
 * @param {number} props.duration - Auto-close duration in ms (default: 5000)
 */
const Toast = ({ message, type = 'success', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const isSuccess = type === 'success';
  const bgColor = isSuccess 
    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  const textColor = isSuccess
    ? 'text-green-800 dark:text-green-200'
    : 'text-red-800 dark:text-red-200';
  const iconColor = isSuccess
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-600 dark:text-red-400';

  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 flex items-start gap-3 p-4 ${bgColor} border rounded-lg shadow-lg max-w-md min-w-[300px] animate-slide-in`}
      role="alert"
    >
      <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <p className={`text-sm font-medium ${textColor} flex-1`}>{message}</p>
      <button
        onClick={onClose}
        className={`${textColor} hover:opacity-70 transition-opacity`}
        aria-label="Fechar notificação"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toast;
