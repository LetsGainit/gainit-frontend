import React from "react";
import { Calendar, AlertCircle, Clock } from "lucide-react";
import "./TaskCard.css";

interface Task {
  taskId: string;
  title: string;
  description: string;
  status: "Todo" | "InProgress" | "Blocked" | "Done";
  priority: "Low" | "Medium" | "High" | "Critical";
  type: string;
  dueAtUtc?: string;
  createdAtUtc: string;
  projectId: string;
}

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  // Task cards always use white background
  const getStatusBackgroundClass = () => {
    return "bg-white";
  };

  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Todo":
        return "status-todo";
      case "InProgress":
        return "status-inprogress";
      case "Blocked":
        return "status-blocked";
      case "Done":
        return "status-done";
      default:
        return "status-todo";
    }
  };

  // Get priority badge color
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Low":
        return "priority-low";
      case "Medium":
        return "priority-medium";
      case "High":
        return "priority-high";
      case "Critical":
        return "priority-critical";
      default:
        return "priority-medium";
    }
  };

  // Format due date
  const formatDueDate = (dueAtUtc?: string) => {
    if (!dueAtUtc) return null;
    const date = new Date(dueAtUtc);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Truncate description to 2 lines
  const truncateDescription = (description: string, maxLength: number = 120) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength).trim() + "...";
  };

  const dueDate = formatDueDate(task.dueAtUtc);

  return (
    <div
      className={`task-card ${getStatusBackgroundClass()}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Task: ${task.title}`}
    >
      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>
        
        <p className="task-description">
          {truncateDescription(task.description)}
        </p>
        
        <div className="task-meta">
          <div className="meta-badges">
            <span className={`status-badge ${getStatusBadgeClass(task.status)}`}>
              {task.status}
            </span>
            
            <span className={`priority-badge ${getPriorityBadgeClass(task.priority)}`}>
              {task.priority}
            </span>
            
            <span className="type-badge">
              {task.type}
            </span>
          </div>
          
          {dueDate && (
            <div className="due-date">
              <Calendar size={14} />
              <span>Due · {dueDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
