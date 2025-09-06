import React from 'react';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { SyncStatus } from '../../services/github.api';

interface SyncBannerProps {
  syncStatus: SyncStatus;
  onDismiss?: () => void;
  className?: string;
}

const SyncBanner: React.FC<SyncBannerProps> = ({
  syncStatus,
  onDismiss,
  className = ''
}) => {
  if (!syncStatus.isRunning && syncStatus.status !== 'failed') {
    return null;
  }

  const getStatusIcon = () => {
    if (syncStatus.status === 'running') {
      return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
    }
    if (syncStatus.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (syncStatus.status === 'failed') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (syncStatus.status === 'running') {
      return 'bg-blue-50 border-blue-200';
    }
    if (syncStatus.status === 'completed') {
      return 'bg-green-50 border-green-200';
    }
    if (syncStatus.status === 'failed') {
      return 'bg-red-50 border-red-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

  const getStatusText = () => {
    if (syncStatus.status === 'running') {
      return 'Syncing repository...';
    }
    if (syncStatus.status === 'completed') {
      return 'Sync completed successfully';
    }
    if (syncStatus.status === 'failed') {
      return 'Sync failed';
    }
    return 'Syncing...';
  };

  return (
    <div className={`${getStatusColor()} border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h4 className="text-sm font-medium text-gray-900">
              {getStatusText()}
            </h4>
            {syncStatus.message && (
              <p className="text-sm text-gray-600 mt-1">
                {syncStatus.message}
              </p>
            )}
            {syncStatus.error && (
              <p className="text-sm text-red-600 mt-1">
                {syncStatus.error}
              </p>
            )}
          </div>
        </div>
        
        {onDismiss && syncStatus.status !== 'running' && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SyncBanner;
