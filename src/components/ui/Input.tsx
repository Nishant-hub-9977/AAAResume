import React, { forwardRef } from 'react';
import { getFocusRingClasses } from '../../styles/tokens';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    hint,
    fullWidth = false, 
    leftIcon,
    rightIcon,
    variant = 'default',
    className = '', 
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const widthClass = fullWidth ? 'w-full' : '';
    const hasError = !!error;
    
    const baseInputClasses = `
      block px-3 py-2.5 text-sm text-gray-900 dark:text-white
      placeholder-gray-500 dark:placeholder-gray-400
      border rounded-lg shadow-sm transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${getFocusRingClasses()}
    `;
    
    const variantClasses = {
      default: `
        border-gray-300 dark:border-gray-600 
        bg-white dark:bg-gray-800
        hover:border-gray-400 dark:hover:border-gray-500
        focus:border-primary-500 dark:focus:border-primary-400
      `,
      filled: `
        border-transparent
        bg-gray-50 dark:bg-gray-700
        hover:bg-gray-100 dark:hover:bg-gray-600
        focus:bg-white dark:focus:bg-gray-800
        focus:border-primary-500 dark:focus:border-primary-400
      `,
      outlined: `
        border-2 border-gray-300 dark:border-gray-600
        bg-transparent
        hover:border-gray-400 dark:hover:border-gray-500
        focus:border-primary-500 dark:focus:border-primary-400
      `,
    };
    
    const errorClasses = hasError 
      ? 'border-error-500 focus:border-error-500 focus:ring-error-500 dark:border-error-400' 
      : '';
    
    const iconPadding = {
      left: leftIcon ? 'pl-10' : '',
      right: rightIcon ? 'pr-10' : '',
    };
    
    const inputClasses = `
      ${baseInputClasses}
      ${variantClasses[variant]}
      ${errorClasses}
      ${iconPadding.left}
      ${iconPadding.right}
      ${widthClass}
      ${className}
    `;

    return (
      <div className={widthClass}>
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
            {props.required && (
              <span className="text-error-500 ml-1" aria-label="required">*</span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-500 h-5 w-5">
                {leftIcon}
              </span>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 dark:text-gray-500 h-5 w-5">
                {rightIcon}
              </span>
            </div>
          )}
        </div>
        
        {hint && !error && (
          <p 
            id={`${inputId}-hint`}
            className="mt-1 text-xs text-gray-500 dark:text-gray-400"
          >
            {hint}
          </p>
        )}
        
        {error && (
          <p 
            id={`${inputId}-error`}
            className="mt-1 text-xs text-error-600 dark:text-error-400 flex items-center"
            role="alert"
          >
            <svg 
              className="w-4 h-4 mr-1 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20" 
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
                clipRule="evenodd" 
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;