import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { getProjectTasks } from "../../../services/tasksService";
import { ClipboardList, Loader, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import TaskCard from "./TaskCard";
import AddTaskModal from "./AddTaskModal";
import "./MyTasks.css";

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

const MyTasks: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  // Generate correlation ID
  const generateCorrelationId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!projectId) return;

    console.log(`[MY-TASKS] Fetching tasks for project ${projectId}`);
    setLoading(true);
    setError(null);

    try {
      const correlationId = generateCorrelationId();
      const tasksData = await getProjectTasks(projectId!, { includeCompleted: false, sortBy: "CreatedAtUtc" }, correlationId);
      
      const safeTasksData = Array.isArray(tasksData) ? tasksData : [];
      console.log(`[MY-TASKS] Successfully fetched ${safeTasksData.length} tasks for project ${projectId}`);
      setTasks(safeTasksData);
    } catch (err) {
      console.error(`[MY-TASKS] Error fetching tasks:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load tasks on mount
  useEffect(() => {
    console.log(`[MY-TASKS] useEffect triggered - projectId: ${projectId}, userInfo:`, userInfo);
    if (projectId) {
      console.log(`[MY-TASKS] Calling fetchTasks`);
      fetchTasks();
    } else {
      console.log(`[MY-TASKS] No projectId, not fetching tasks`);
    }
  }, [projectId, fetchTasks]);

  // Handle task click
  const handleTaskClick = (taskId: string) => {
    navigate(`/work/projects/${projectId}/tasks/${taskId}`);
  };

  // Handle retry
  const handleRetry = () => {
    fetchTasks();
  };

  // Group tasks by status
  const groupTasksByStatus = (tasks: Task[]) => {
    if (!tasks || !Array.isArray(tasks)) {
      return {
        Todo: [],
        InProgress: [],
        Blocked: [],
        Done: []
      };
    }
    
    const grouped = {
      Todo: tasks.filter(task => task.status === "Todo"),
      InProgress: tasks.filter(task => task.status === "InProgress"),
      Blocked: tasks.filter(task => task.status === "Blocked"),
      Done: tasks.filter(task => task.status === "Done")
    };
    return grouped;
  };

  // Get status group configuration
  const getStatusGroupConfig = (status: string) => {
    const configs = {
      Todo: {
        title: "Todo",
        bgClass: "bg-gray-50",
        icon: ClipboardList,
        iconColor: "text-gray-500"
      },
      InProgress: {
        title: "In Progress",
        bgClass: "bg-indigo-50",
        icon: Loader,
        iconColor: "text-indigo-500"
      },
      Blocked: {
        title: "Blocked",
        bgClass: "bg-red-50",
        icon: AlertCircle,
        iconColor: "text-red-500"
      },
      Done: {
        title: "Completed",
        bgClass: "bg-green-50",
        icon: CheckCircle2,
        iconColor: "text-green-500"
      }
    };
    return configs[status as keyof typeof configs] || configs.Todo;
  };

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="my-tasks-skeleton">
      {[1, 2, 3].map((i) => (
        <div key={i} className="task-card-skeleton">
          <div className="skeleton-title"></div>
          <div className="skeleton-description"></div>
          <div className="skeleton-description"></div>
          <div className="skeleton-meta"></div>
        </div>
      ))}
    </div>
  );

  // Error state
  const renderError = () => (
    <div className="my-tasks-error">
      <div className="error-card">
        <h3>Unable to load tasks</h3>
        <p>{error}</p>
        <button className="retry-button" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    </div>
  );

  // Empty state
  const renderEmpty = () => (
    <div className="my-tasks-empty">
      <div className="empty-card">
        <h3>No tasks assigned to you in this project yet</h3>
        <p>Tasks will appear here once they are assigned to you.</p>
      </div>
    </div>
  );

  // Group tasks by status
  const groupedTasks = groupTasksByStatus(tasks || []);
  const statusGroups = Object.entries(groupedTasks).filter(([_, taskList]) => taskList && taskList.length > 0);

  return (
    <div className="my-tasks-container">
      {/* Add Task Button */}
      <div className="my-tasks-header">
        <button 
          className="add-task-button"
          onClick={() => setIsAddTaskModalOpen(true)}
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {loading && renderSkeleton()}
      
      {error && !loading && renderError()}
      
      {!loading && !error && (!Array.isArray(tasks) || tasks.length === 0) && renderEmpty()}
      
      {!loading && !error && Array.isArray(tasks) && tasks.length > 0 && (
        <div className="my-tasks-grid">
          {statusGroups.map(([status, statusTasks]) => {
            const config = getStatusGroupConfig(status);
            return (
              <div
                key={status}
                className={`status-group ${config.bgClass}`}
              >
                <div className="status-group-header">
                  <div className="status-group-title-container">
                    <config.icon 
                      size={20} 
                      className={`status-group-icon ${config.iconColor} ${status === 'InProgress' ? 'animate-spin' : ''}`} 
                    />
                    <h3 className="status-group-title">{config.title}</h3>
                  </div>
                  <span className="status-group-count">{Array.isArray(statusTasks) ? statusTasks.length : 0}</span>
                </div>
                <div className="status-group-content">
                  {Array.isArray(statusTasks) && statusTasks.map((task) => (
                    <TaskCard
                      key={task.taskId}
                      task={task}
                      onClick={() => handleTaskClick(task.taskId)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSubmit={(taskData) => {
          console.log('New task data:', taskData);
          setIsAddTaskModalOpen(false);
        }}
      />
    </div>
  );
};

export default MyTasks;
