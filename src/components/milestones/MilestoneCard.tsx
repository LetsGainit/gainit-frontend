import React, { useState } from 'react';
import { Edit, MoreVertical, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Milestone, MilestoneStatus } from '../../services/milestones.api';
import StatusPill from './StatusPill';
import ProgressBar from './ProgressBar';

interface MilestoneCardProps {
  milestone: Milestone;
  onEdit: (milestone: Milestone) => void;
  onStatusChange: (milestoneId: string, status: MilestoneStatus) => void;
  onDelete: (milestoneId: string) => void;
  className?: string;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  onEdit,
  onStatusChange,
  onDelete,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);

  const formatTargetDate = (targetDateUtc: string) => {
    const date = new Date(targetDateUtc);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return {
        text: `${Math.abs(diffDays)} days overdue`,
        color: 'text-red-600',
        icon: AlertCircle
      };
    } else if (diffDays === 0) {
      return {
        text: 'Due today',
        color: 'text-orange-600',
        icon: Clock
      };
    } else if (diffDays === 1) {
      return {
        text: 'Due tomorrow',
        color: 'text-orange-600',
        icon: Clock
      };
    } else {
      return {
        text: `Due in ${diffDays} days`,
        color: 'text-gray-600',
        icon: Clock
      };
    }
  };

  const getStatusOptions = (currentStatus: MilestoneStatus): MilestoneStatus[] => {
    switch (currentStatus) {
      case 'Planned':
        return ['Active', 'Completed'];
      case 'Active':
        return ['Planned', 'Completed'];
      case 'Completed':
        return ['Planned', 'Active'];
      default:
        return ['Planned', 'Active', 'Completed'];
    }
  };

  const dateInfo = formatTargetDate(milestone.targetDateUtc);
  const StatusIcon = dateInfo.icon;

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
            {milestone.title}
          </h3>
          <StatusPill status={milestone.status} />
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(milestone);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                
                {getStatusOptions(milestone.status).map((status) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(milestone.milestoneId, status);
                      setShowActions(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as {status}
                  </button>
                ))}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Are you sure you want to delete this milestone?')) {
                      onDelete(milestone.milestoneId);
                    }
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {milestone.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {milestone.description}
        </p>
      )}

      {/* Progress */}
      <div className="mb-3">
        <ProgressBar
          done={milestone.doneTasksCount}
          total={milestone.tasksCount}
        />
      </div>

      {/* Target Date */}
      <div className="flex items-center gap-2 text-sm">
        <StatusIcon className={`w-4 h-4 ${dateInfo.color}`} />
        <span className={dateInfo.color}>
          {dateInfo.text}
        </span>
        <span className="text-gray-400">
          • {new Date(milestone.targetDateUtc).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default MilestoneCard;
