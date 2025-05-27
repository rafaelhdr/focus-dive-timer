
import * as Sentry from "@sentry/react";
import { ReactNode } from "react";

interface SentryErrorBoundaryProps {
  children: ReactNode;
}

const SentryErrorBoundary = ({ children }: SentryErrorBoundaryProps) => {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                We've been notified of this error and will fix it soon.
              </p>
              <button
                onClick={resetError}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Try again
              </button>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    Error details (development only)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 overflow-auto">
                    {error?.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )}
      showDialog
    >
      {children}
    </Sentry.ErrorBoundary>
  );
};

export default SentryErrorBoundary;
