import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import Button from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 mb-4">
                  <RefreshCw className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-red-800 mb-2">
                    Something went wrong
                  </h3>
                  <div className="text-sm text-red-700">
                    <p>
                      We're experiencing technical difficulties. Please try refreshing the page or come back later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              fullWidth
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;