import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';

const GuestBanner: React.FC = () => {
  const { user } = useAuth();
  const isAnonymous = user?.app_metadata?.provider === 'anonymous';

  if (!isAnonymous) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-sm text-amber-700">
              You're using a guest account. Some features may be limited.
            </p>
          </div>
          <Link to="/signup">
            <Button variant="primary" size="sm">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GuestBanner;