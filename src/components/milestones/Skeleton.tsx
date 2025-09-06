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
  <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="w-6 h-6" />
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-2/3 mb-3" />
    <div className="space-y-2">
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const SkeletonSummaryBar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div>
        <Skeleton className="h-6 w-40 mb-2" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex gap-4">
        <div className="text-right">
          <Skeleton className="h-8 w-8 mb-1" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="text-right">
          <Skeleton className="h-8 w-8 mb-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
    <Skeleton className="h-2 w-full max-w-md" />
  </div>
);

export default Skeleton;
