import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfigurationError: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Configuration Error
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          The application is missing required environment variables.
        </p>
      </div>
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Missing Supabase Configuration
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                The application cannot connect to the database because the Supabase environment variables are missing.
                If you are the administrator, please check the deployment configuration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);