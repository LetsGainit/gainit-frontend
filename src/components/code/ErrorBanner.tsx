import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  correlationId?: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  correlationId,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
          <p className="text-sm text-red-700 mb-2">{message}</p>
          {correlationId && (
            <p className="text-xs text-red-600 font-mono">
              Correlation ID: {correlationId}
            </p>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 flex items-center text-sm text-red-700 hover:text-red-800 font-medium"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
