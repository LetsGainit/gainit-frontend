import React from 'react';
import { Target } from 'lucide-react';

interface EmptyStateProps {
  onCreateMilestone: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  onCreateMilestone,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Target className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Milestones Yet</h3>
      <p className="text-gray-600 mb-6 max-w-md">
        Create your first milestone to start tracking project progress and keep your team aligned on goals.
      </p>
      <button
        onClick={onCreateMilestone}
        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
      >
        Create Milestone
      </button>
    </div>
  );
};

export default EmptyState;
