import React from 'react';
import { Milestone } from '../../services/milestones.api';
import ProgressBar from './ProgressBar';

interface SummaryBarProps {
  milestones: Milestone[];
  className?: string;
}

const SummaryBar: React.FC<SummaryBarProps> = ({ milestones, className = '' }) => {
  const total = milestones.length;
  const completed = milestones.filter(m => m.status === 'Completed').length;
  
  const totalTasks = milestones.reduce((sum, m) => sum + m.tasksCount, 0);
  const doneTasks = milestones.reduce((sum, m) => sum + m.doneTasksCount, 0);
  const overallProgress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0;

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Project Milestones</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Total: {total}</span>
            <span>Completed: {completed}</span>
            <span>Progress: {Math.round(overallProgress)}%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>
      </div>
      
      {total > 0 && (
        <div className="mt-4">
          <ProgressBar
            done={doneTasks}
            total={totalTasks}
            showLabel={false}
            className="max-w-md"
          />
        </div>
      )}
    </div>
  );
};

export default SummaryBar;
