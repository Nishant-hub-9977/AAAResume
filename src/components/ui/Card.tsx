import React from 'react';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  className = '',
  children,
  variant = 'default',
  padding = 'md',
  interactive = false,
  onClick,
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl',
    outlined: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700',
    filled: 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const interactiveClasses = interactive 
    ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800' 
    : '';
  
  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${interactiveClasses}
    ${className}
  `;

  const Component = interactive ? 'button' : 'div';

  return (
    <Component
      className={cardClasses}
      onClick={onClick}
      {...(interactive && { role: 'button', tabIndex: 0 })}
    >
      {children}
    </Component>
  );
};

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ className = '', children }) => {
  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 ${className}`}>
      {children}
    </div>
  );
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({ className = '', children }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

const CardFooter: React.FC<CardFooterProps> = ({ className = '', children }) => {
  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 pt-4 mt-6 ${className}`}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter };