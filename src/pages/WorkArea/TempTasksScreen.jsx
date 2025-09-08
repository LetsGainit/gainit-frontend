import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./TempTasksScreen.css";

const ENABLE_TEMP_TASKS_SCREEN = true; // Feature flag

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

  // Don't render if feature flag is disabled
  if (!ENABLE_TEMP_TASKS_SCREEN) {
    return null;
  }

  return (
    <div className="temp-tasks-screen">
      {/* Header */}
      <div className="temp-tasks-header">
        <div className="header-content">
          <h1 className="page-title">My Tasks (Temp)</h1>
          <p className="page-subtitle">
            Project ID: {projectId}
          </p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="temp-tasks-controls">
        <div className="controls-info">
          <span className="info-badge">
            page={page} • size={pageSize} • sort={sort}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="temp-tasks-content">
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

        {/* Tasks List */}
        {!loading && !error && tasks.length > 0 && (
          <div className="tasks-list">
            <div className="tasks-header">
              <h3>Tasks ({tasks.length})</h3>
            </div>
            <div className="tasks-grid">
              {tasks.map((task) => (
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
        )}
      </div>
    </div>
  );
};

export default TempTasksScreen;
