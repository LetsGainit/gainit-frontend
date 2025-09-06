import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📁',
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 mb-4 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
};

export default EmptyState;
