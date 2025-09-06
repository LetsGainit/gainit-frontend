import React from 'react';
import { MilestoneStatus } from '../../services/milestones.api';

interface StatusPillProps {
  status: MilestoneStatus;
  className?: string;
}

const StatusPill: React.FC<StatusPillProps> = ({ status, className = '' }) => {
  const getStatusConfig = (status: MilestoneStatus) => {
    switch (status) {
      case 'Planned':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          label: 'Planned'
        };
      case 'Active':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          label: 'Active'
        };
      case 'Completed':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          label: 'Completed'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      {config.label}
    </span>
  );
};

export default StatusPill;
