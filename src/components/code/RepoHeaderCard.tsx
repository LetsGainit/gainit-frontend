import React from 'react';
import { ExternalLink, Star, GitFork, Globe, Lock, RefreshCw } from 'lucide-react';
import { Repository } from '../../services/github.api';
import Chip from '../common/Chip';

interface RepoHeaderCardProps {
  repository: Repository;
  onSync: () => void;
  isSyncing?: boolean;
  className?: string;
}

const RepoHeaderCard: React.FC<RepoHeaderCardProps> = ({
  repository,
  onSync,
  isSyncing = false,
  className = ''
}) => {
  const {
    fullName,
    description,
    primaryLanguage,
    languages,
    starsCount,
    forksCount,
    isPublic,
    url
  } = repository;

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
      {/* Header with title and actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-semibold text-gray-900 truncate">
              {fullName}
            </h2>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Open on GitHub
            </a>
          </div>
          
          {description && (
            <p className="text-gray-600 text-sm mb-3">{description}</p>
          )}
        </div>
        
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync now'}
        </button>
      </div>

      {/* Stats and metadata */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {/* Stars */}
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Star className="w-4 h-4" />
          <span>{starsCount.toLocaleString()}</span>
        </div>
        
        {/* Forks */}
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <GitFork className="w-4 h-4" />
          <span>{forksCount.toLocaleString()}</span>
        </div>
        
        {/* Visibility */}
        <div className="flex items-center gap-1 text-sm">
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
      </div>

      {/* Languages */}
      <div className="space-y-2">
        {primaryLanguage && (
          <div>
            <span className="text-sm font-medium text-gray-700">Primary Language: </span>
            <Chip variant="primary" size="sm">
              {primaryLanguage}
            </Chip>
          </div>
        )}
        
        {languages.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-700">Languages: </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {languages.slice(0, 8).map((lang, index) => (
                <Chip key={index} variant="default" size="sm">
                  {lang}
                </Chip>
              ))}
              {languages.length > 8 && (
                <Chip variant="default" size="sm">
                  +{languages.length - 8} more
                </Chip>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoHeaderCard;
