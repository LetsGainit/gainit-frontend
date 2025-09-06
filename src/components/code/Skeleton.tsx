import React from 'react';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', children }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}>
      {children}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
    <Skeleton className="h-6 w-1/3 mb-4" />
    <Skeleton className="h-4 w-2/3 mb-2" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const SkeletonRepoHeader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Skeleton className="h-6 w-1/2 mb-2" />
        <Skeleton className="h-4 w-3/4 mb-3" />
      </div>
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="flex gap-4 mb-4">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-1/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-14" />
      </div>
    </div>
  </div>
);

export const SkeletonContributors: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
    <Skeleton className="h-6 w-32 mb-4" />
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
