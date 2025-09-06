import React from 'react';
import { Clock, Globe, Lock, Code } from 'lucide-react';
import { SyncStatus } from '../../services/github.api';

interface RepoStatusPanelProps {
  syncStatus: SyncStatus;
  isPublic?: boolean;
  primaryLanguage?: string;
  className?: string;
}

const RepoStatusPanel: React.FC<RepoStatusPanelProps> = ({
  syncStatus,
  isPublic,
  primaryLanguage,
  className = ''
}) => {
  const formatLastSync = (lastSyncTime?: string) => {
    if (!lastSyncTime) return 'Never synced';
    
    const date = new Date(lastSyncTime);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Last sync */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              Last sync: {formatLastSync(syncStatus.lastSyncTime)}
            </span>
          </div>
          
          {/* Visibility */}
          {isPublic !== undefined && (
            <div className="flex items-center gap-2 text-sm">
              {isPublic ? (
                <>
                  <Globe className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 font-medium">Private</span>
                </>
              )}
            </div>
          )}
          
          {/* Primary language */}
          {primaryLanguage && (
            <div className="flex items-center gap-2 text-sm">
              <Code className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{primaryLanguage}</span>
            </div>
          )}
        </div>
        
        {/* Sync status */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            syncStatus.status === 'running' ? 'bg-blue-500 animate-pulse' :
            syncStatus.status === 'completed' ? 'bg-green-500' :
            syncStatus.status === 'failed' ? 'bg-red-500' :
            'bg-gray-400'
          }`} />
          <span className={`text-sm font-medium ${getStatusColor(syncStatus.status)}`}>
            {syncStatus.status === 'running' ? 'Syncing...' :
             syncStatus.status === 'completed' ? 'Up to date' :
             syncStatus.status === 'failed' ? 'Sync failed' :
             'Idle'}
          </span>
        </div>
      </div>
      
      {/* Status message */}
      {syncStatus.message && (
        <div className="mt-3 text-sm text-gray-600">
          {syncStatus.message}
        </div>
      )}
    </div>
  );
};

export default RepoStatusPanel;
