import React, { forwardRef } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, icon: Icon, fullWidth = false, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';
    const errorClass = error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500';
    
    return (
      <div className={`${widthClass}`}>
        <label 
          htmlFor={props.id} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
        <div className="relative rounded-md shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <input
            ref={ref}
            className={`
              appearance-none block px-3 py-2 border rounded-md shadow-sm 
              placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm
              ${Icon ? 'pl-10' : ''} ${errorClass} ${widthClass} ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;