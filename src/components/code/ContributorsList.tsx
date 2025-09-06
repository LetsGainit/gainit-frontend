import React from 'react';
import { ExternalLink, GitCommit, GitPullRequest, MessageSquare } from 'lucide-react';
import { Contribution } from '../../services/github.api';

interface ContributorsListProps {
  contributions: Contribution[];
  loading?: boolean;
  className?: string;
}

const ContributorsList: React.FC<ContributorsListProps> = ({
  contributions,
  loading = false,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contributors</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="flex gap-4">
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-14 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contributors</h3>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No contributions detected yet</h4>
          <p className="text-sm text-gray-500 text-center">
            Contributions will appear here once the repository is synced and activity is detected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Contributors ({contributions.length})
      </h3>
      
      <div className="space-y-3">
        {contributions.map((contributor, index) => (
          <div
            key={contributor.username}
            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            {/* Avatar */}
            <img
              src={contributor.avatarUrl}
              alt={contributor.username}
              className="w-10 h-10 rounded-full border border-gray-200"
              onError={(e) => {
                e.currentTarget.src = '/avatar-default-image.png';
              }}
            />
            
            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-gray-900 truncate">
                  {contributor.username}
                </span>
                <a
                  href={contributor.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <GitCommit className="w-3 h-3" />
                  <span>{contributor.commits}</span>
                </div>
                
                {contributor.pullRequests !== undefined && (
                  <div className="flex items-center gap-1">
                    <GitPullRequest className="w-3 h-3" />
                    <span>{contributor.pullRequests}</span>
                  </div>
                )}
                
                {contributor.codeReviews !== undefined && (
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{contributor.codeReviews}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributorsList;
