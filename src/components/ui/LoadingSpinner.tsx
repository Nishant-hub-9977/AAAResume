import React from 'react';
import Spinner from './Spinner';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Spinner size="lg" />
    </div>
  );
};

export default LoadingSpinner;