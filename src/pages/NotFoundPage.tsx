import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <FileQuestion className="h-24 w-24 text-indigo-400 mb-6 animate-pulse" />
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2 text-center">Page Not Found</h1>
      <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/">
          <Button 
            variant="primary" 
            icon={<Home className="h-4 w-4 mr-2" />}
          >
            Go Home
          </Button>
        </Link>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          icon={<ArrowLeft className="h-4 w-4 mr-2" />}
        >
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;