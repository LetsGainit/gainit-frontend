import React from 'react';

interface ProgressBarProps {
  done: number;
  total: number;
  className?: string;
  showLabel?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  done,
  total,
  className = '',
  showLabel = true
}) => {
  const percentage = total > 0 ? Math.min(100, Math.max(0, (done / total) * 100)) : 0;
  const isComplete = percentage === 100;
  const hasNoTasks = total === 0;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-gray-600">
            {hasNoTasks ? 'No tasks yet' : `${done} / ${total} tasks`}
          </span>
          <span className="text-sm font-medium text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-green-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {hasNoTasks && (
        <p className="text-xs text-gray-500 mt-1">Add tasks to track progress</p>
      )}
    </div>
  );
};

export default ProgressBar;
