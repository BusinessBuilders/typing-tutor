import { ErrorInfo } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  children: React.ReactNode;
}

/**
 * App-level Error Boundary with custom error handling
 */
function AppErrorBoundary({ children }: Props) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('App Error:', error);
      console.error('Error Info:', errorInfo);
    }

    // In production, you could send errors to a logging service
    // Example: logErrorToService(error, errorInfo);
  };

  const fallbackUI = (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="card max-w-2xl mx-4 text-center">
        <div className="text-7xl mb-6">🌟</div>
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--color-primary-600)' }}>
          Let's Take a Break
        </h1>
        <p className="text-xl mb-6" style={{ color: 'var(--color-calm-700)' }}>
          Something unexpected happened, but that's okay! Even computers need a moment to rest.
        </p>
        <p className="text-lg mb-8" style={{ color: 'var(--color-calm-600)' }}>
          Click the button below to start fresh.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary text-xl px-8 py-4"
        >
          Start Fresh
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallbackUI} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}

export default AppErrorBoundary;
