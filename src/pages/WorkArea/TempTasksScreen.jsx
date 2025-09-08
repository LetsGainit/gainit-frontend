import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ClipboardList, Loader, AlertCircle, CheckCircle2, Plus } from "lucide-react";
import api from "../../services/api";
import "./TempTasksScreen.css";

const ENABLE_TEMP_TASKS_SCREEN = true; // Feature flag - keeping temp screen enabled

const TempTasksScreen = () => {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('[TempTasksScreen] Component loaded with projectId:', projectId);

  // Get query parameters with defaults
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  const pageSize = parseInt(searchParams.get('pageSize')) || 20;
  const sort = searchParams.get('sort') || 'priority';

  // Fetch tasks from API
  const fetchTasks = async () => {
    if (!projectId) {
      setError("Project ID is required");
      setLoading(false);
      return;
    }

    // Validate projectId is not a placeholder
    if (projectId === 'test-project-id') {
      setError("Invalid project ID. Please select a valid project.");
      setLoading(false);
      return;
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sort: sort
      });

      // Only add status if it exists
      if (status) {
        params.append('status', status);
      }

      const url = `/projects/${projectId}/tasks/my-tasks?${params.toString()}`;
      
      console.log(`[TempTasksScreen] fetching my-tasks for projectId=${projectId}, status=${status || 'none'}`);
      console.log(`[TempTasksScreen] Full API URL: ${url}`);

      const response = await api.get(url, {
        signal: abortControllerRef.current.signal
      });

      const tasksData = response.data || [];
      setTasks(tasksData);
      
      console.log(`[TempTasksScreen] fetched ${tasksData.length} tasks successfully`);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[TempTasksScreen] Request was aborted');
        return;
      }

      console.error('[TempTasksScreen] Error fetching tasks:', err);
      
      if (err.response?.status === 401) {
        setError("Authentication failed. Please sign in again.");
        // Could redirect to login here if needed
      } else if (err.response?.status === 404) {
        setError("Project not found.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else {
        setError(err.response?.data?.message || "Failed to load tasks. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks on mount and when dependencies change
  useEffect(() => {
    fetchTasks();

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [projectId, status, page, pageSize, sort]);

  // Handle refresh
  const handleRefresh = () => {
    fetchTasks();
  };

  // Handle back to My Projects
  const handleBackToProjects = () => {
    navigate('/work');
  };

  // Group tasks by status
  const groupTasksByStatus = (tasks) => {
    // Ensure we always have a valid array to work with
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    
    const grouped = {
      Todo: safeTasks.filter(task => task && task.status === "Todo"),
      InProgress: safeTasks.filter(task => task && task.status === "InProgress"),
      Blocked: safeTasks.filter(task => task && task.status === "Blocked"),
      Done: safeTasks.filter(task => task && task.status === "Done")
    };
    return grouped;
  };

  // Get status group configuration
  const getStatusGroupConfig = (status) => {
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
    return configs[status] || configs.Todo;
  };

  // Don't render if feature flag is disabled
  if (!ENABLE_TEMP_TASKS_SCREEN) {
    return null;
  }

  // Group tasks by status - ensure tasks is always an array
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const groupedTasks = groupTasksByStatus(safeTasks);
  const statusGroups = Object.entries(groupedTasks).filter(([_, taskList]) => Array.isArray(taskList) && taskList && taskList.length > 0);

  return (
    <div className="my-tasks-container">
      {/* Add Task Button */}
      <div className="my-tasks-header">
        <button 
          className="add-task-button"
          onClick={() => {
            // TODO: Implement add task functionality
            console.log('Add task clicked');
          }}
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Content */}
      <div className="my-tasks-content">
        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-message">Loading tasks...</div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <div className="error-content">
              <h3>Error Loading Tasks</h3>
              <p>{error}</p>
              <div className="error-actions">
                <button 
                  className="btn-primary"
                  onClick={handleRefresh}
                >
                  Try Again
                </button>
                {error === "Project not found." && (
                  <button 
                    className="btn-secondary"
                    onClick={handleBackToProjects}
                  >
                    Back to My Projects
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-content">
              <h3>No tasks found for this project.</h3>
              <p>There are no tasks assigned to you in this project.</p>
              <button 
                className="btn-primary"
                onClick={handleRefresh}
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Tasks Grid with Status Groups */}
        {!loading && !error && safeTasks.length > 0 && (
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
                      <div key={task.taskId} className="task-card">
                        <div className="task-header">
                          <h4 className="task-title">{task.title}</h4>
                          <div className="task-badges">
                            <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
                              {task.priority}
                            </span>
                            <span className={`status-badge status-${task.status?.toLowerCase()}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="task-description">
                            {task.description.length > 100 
                              ? `${task.description.substring(0, 100)}...` 
                              : task.description
                            }
                          </p>
                        )}
                        
                        <div className="task-meta">
                          <div className="task-info">
                            <span className="task-type">{task.type}</span>
                            {task.milestoneTitle && (
                              <span className="task-milestone">Milestone: {task.milestoneTitle}</span>
                            )}
                          </div>
                          <div className="task-progress">
                            <span className="subtask-count">
                              {task.completedSubtaskCount}/{task.subtaskCount} subtasks
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TempTasksScreen;
