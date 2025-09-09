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
    <div className="temp-tasks-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Task Dashboard</h1>
          <p className="dashboard-subtitle">Your project tasks at a glance</p>
        </div>
        <div className="header-right">
          <button 
            className="action-button primary"
            onClick={() => {
              // TODO: Implement add task functionality
              console.log('Add task clicked');
            }}
          >
            <Plus size={18} />
            New Task
          </button>
          <button 
            className="action-button secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon todo">
            <ClipboardList size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{groupedTasks.Todo?.length || 0}</span>
            <span className="stat-label">To Do</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon in-progress">
            <Loader size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{groupedTasks.InProgress?.length || 0}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blocked">
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{groupedTasks.Blocked?.length || 0}</span>
            <span className="stat-label">Blocked</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon done">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-number">{groupedTasks.Done?.length || 0}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
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

        {/* Tasks Timeline View */}
        {!loading && !error && safeTasks.length > 0 && (
          <div className="tasks-timeline">
            <div className="timeline-header">
              <h2 className="timeline-title">Task Timeline</h2>
              <div className="timeline-filters">
                <span className="filter-badge">All Tasks</span>
                <span className="filter-badge">Recent</span>
                <span className="filter-badge">High Priority</span>
              </div>
            </div>
            
            <div className="timeline-container">
              {safeTasks.map((task, index) => (
                <div key={task.taskId} className={`timeline-item ${task.status?.toLowerCase()}`}>
                  <div className="timeline-marker">
                    <div className={`marker-dot ${task.priority?.toLowerCase()}`}></div>
                    {index < safeTasks.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  
                  <div className="timeline-content">
                    <div className="task-card-modern">
                      <div className="task-header-modern">
                        <div className="task-title-section">
                          <h3 className="task-title-modern">{task.title}</h3>
                          <div className="task-meta-modern">
                            <span className="task-type-modern">{task.type}</span>
                            {task.milestoneTitle && (
                              <span className="task-milestone-modern">• {task.milestoneTitle}</span>
                            )}
                          </div>
                        </div>
                        <div className="task-badges-modern">
                          <span className={`priority-badge-modern ${task.priority?.toLowerCase()}`}>
                            {task.priority}
                          </span>
                          <span className={`status-badge-modern ${task.status?.toLowerCase()}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="task-description-modern">
                          {task.description.length > 120 
                            ? `${task.description.substring(0, 120)}...` 
                            : task.description
                          }
                        </p>
                      )}
                      
                      <div className="task-footer-modern">
                        <div className="task-progress-modern">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{
                                width: `${task.subtaskCount > 0 ? (task.completedSubtaskCount / task.subtaskCount) * 100 : 0}%`
                              }}
                            ></div>
                          </div>
                          <span className="progress-text">
                            {task.completedSubtaskCount}/{task.subtaskCount} subtasks
                          </span>
                        </div>
                        <div className="task-actions">
                          <button className="action-btn">View</button>
                          <button className="action-btn">Edit</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TempTasksScreen;
