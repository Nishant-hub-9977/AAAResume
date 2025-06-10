import React from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className = '',
  dismissible = false,
  onDismiss,
  icon,
}) => {
  const baseClasses = 'rounded-lg border p-4 transition-all duration-200';
  
  const variantClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
    success: 'bg-success-50 border-success-200 text-success-800 dark:bg-success-900/20 dark:border-success-800 dark:text-success-300',
    warning: 'bg-warning-50 border-warning-200 text-warning-800 dark:bg-warning-900/20 dark:border-warning-800 dark:text-warning-300',
    error: 'bg-error-50 border-error-200 text-error-800 dark:bg-error-900/20 dark:border-error-800 dark:text-error-300',
  };

  const iconMap = {
    info: icon || <Info className="h-5 w-5" />,
    success: icon || <CheckCircle className="h-5 w-5" />,
    warning: icon || <AlertTriangle className="h-5 w-5" />,
    error: icon || <XCircle className="h-5 w-5" />,
  };

  const alertClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <div className={alertClasses} role="alert">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {iconMap[variant]}
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-semibold mb-1">
              {title}
            </h3>
          )}
          <div className={`text-sm ${title ? '' : 'mt-0'}`}>
            {children}
          </div>
        </div>
        
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 transition-colors duration-200"
              aria-label="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;