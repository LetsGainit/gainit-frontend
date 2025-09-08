import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Plus, Edit2, Trash2, GripVertical, Check, X, Loader, AlertCircle } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import WorkAreaLayout from "../../../components/layout/WorkAreaLayout";
import Footer from "../../../components/Footer";
import SubtaskItem from "./SubtaskItem.tsx";
import { getTask, createSubtask, updateSubtask, toggleSubtask, deleteSubtask, Task, Subtask, CreateSubtaskDto, UpdateSubtaskDto } from "../../../services/tasks.api";
import "./TaskDetails.css";

// Task and Subtask interfaces are now imported from tasks.api.ts

const TaskDetails: React.FC = () => {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  
  // State management
  const [task, setTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [activeView, setActiveView] = useState("my-projects");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  // Derived counters - with safety checks
  const safeSubtasks = Array.isArray(subtasks) ? subtasks : [];
  const completedSubtaskCount = task?.completedSubtaskCount || safeSubtasks.filter(subtask => subtask && subtask.isDone).length;
  const subtaskCount = task?.subtaskCount || safeSubtasks.length;

  // Fetch task data
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!taskId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        console.log(`[TASK-DETAILS] Fetching task ${taskId}`);
        const taskData = await getTask(taskId);
        setTask(taskData);
        setSubtasks(taskData.subtasks || []);
        console.log(`[TASK-DETAILS] Successfully loaded task:`, taskData);
      } catch (err) {
        console.error(`[TASK-DETAILS] Error fetching task:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load task');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [taskId]);

  // Handle back navigation
  const handleBack = () => {
    navigate(`/work/projects/${projectId}`);
  };

  // Handle status change
  const handleStatusChange = (newStatus: "Todo" | "InProgress" | "Blocked" | "Done") => {
    if (task) {
      setTask(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // Add new subtask
  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !taskId || isAddingSubtask) return;

    setIsAddingSubtask(true);
    try {
      const dto: CreateSubtaskDto = {
        title: newSubtaskTitle.trim(),
        description: undefined,
        orderIndex: Math.max(...safeSubtasks.map(s => s && s.orderIndex ? s.orderIndex : 0), 0) + 1
      };

      console.log(`[TASK-DETAILS] Creating subtask for task ${taskId}`);
      const newSubtask = await createSubtask(taskId, dto);
      setSubtasks(prev => [...prev, newSubtask]);
      setNewSubtaskTitle("");
      console.log(`[TASK-DETAILS] Successfully created subtask:`, newSubtask);
    } catch (err) {
      console.error(`[TASK-DETAILS] Error creating subtask:`, err);
      setError(err instanceof Error ? err.message : 'Failed to create subtask');
    } finally {
      setIsAddingSubtask(false);
    }
  };

  // Toggle subtask completion
  const handleToggleSubtask = async (subtaskId: string) => {
    if (!taskId) return;

    try {
      console.log(`[TASK-DETAILS] Toggling subtask ${subtaskId}`);
      const updatedSubtask = await toggleSubtask(taskId, subtaskId);
      setSubtasks(prev => 
        prev.map(subtask => 
          subtask.subtaskId === subtaskId ? updatedSubtask : subtask
        )
      );
      console.log(`[TASK-DETAILS] Successfully toggled subtask:`, updatedSubtask);
    } catch (err) {
      console.error(`[TASK-DETAILS] Error toggling subtask:`, err);
      setError(err instanceof Error ? err.message : 'Failed to toggle subtask');
    }
  };

  // Edit subtask title
  const handleEditSubtask = async (subtaskId: string, newTitle: string) => {
    if (!taskId || !newTitle.trim()) return;

    try {
      const dto: UpdateSubtaskDto = {
        title: newTitle.trim()
      };

      console.log(`[TASK-DETAILS] Updating subtask ${subtaskId}`);
      const updatedSubtask = await updateSubtask(taskId, subtaskId, dto);
      setSubtasks(prev => 
        prev.map(subtask => 
          subtask.subtaskId === subtaskId ? updatedSubtask : subtask
        )
      );
      console.log(`[TASK-DETAILS] Successfully updated subtask:`, updatedSubtask);
    } catch (err) {
      console.error(`[TASK-DETAILS] Error updating subtask:`, err);
      setError(err instanceof Error ? err.message : 'Failed to update subtask');
    }
  };

  // Delete subtask
  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!taskId || !window.confirm("Are you sure you want to delete this subtask?")) return;

    try {
      console.log(`[TASK-DETAILS] Deleting subtask ${subtaskId}`);
      await deleteSubtask(taskId, subtaskId);
      setSubtasks(prev => prev.filter(subtask => subtask.subtaskId !== subtaskId));
      console.log(`[TASK-DETAILS] Successfully deleted subtask ${subtaskId}`);
    } catch (err) {
      console.error(`[TASK-DETAILS] Error deleting subtask:`, err);
      setError(err instanceof Error ? err.message : 'Failed to delete subtask');
    }
  };

  // Reorder subtasks
  const handleReorderSubtasks = (reorderedSubtasks: Subtask[]) => {
    const updatedSubtasks = reorderedSubtasks.map((subtask, index) => ({
      ...subtask,
      orderIndex: index + 1
    }));
    setSubtasks(updatedSubtasks);
  };

  // Get status badge class
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

  // Get priority badge class
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

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Sort subtasks: open first, then done - with safety checks
  const sortedSubtasks = [...safeSubtasks].sort((a, b) => {
    if (!a || !b) return 0;
    if (a.isDone === b.isDone) {
      return (a.orderIndex || 0) - (b.orderIndex || 0);
    }
    return a.isDone ? 1 : -1;
  });

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="task-details-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-back-button"></div>
        <div className="skeleton-title"></div>
      </div>
      <div className="skeleton-meta"></div>
      <div className="skeleton-description"></div>
      <div className="skeleton-subtasks">
        <div className="skeleton-subtask"></div>
        <div className="skeleton-subtask"></div>
        <div className="skeleton-subtask"></div>
      </div>
    </div>
  );

  // Error state
  const renderError = () => (
    <div className="task-details-error">
      <div className="error-card">
        <AlertCircle className="error-icon" size={48} />
        <h3>Unable to load task</h3>
        <p>{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <div className="work-area-content">
          <WorkAreaLayout activeView={activeView} setActiveView={setActiveView}>
            <div className="task-details-page">
              {renderSkeleton()}
            </div>
          </WorkAreaLayout>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !task) {
    return (
      <>
        <div className="work-area-content">
          <WorkAreaLayout activeView={activeView} setActiveView={setActiveView}>
            <div className="task-details-page">
              {renderError()}
            </div>
          </WorkAreaLayout>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="work-area-content">
        <WorkAreaLayout activeView={activeView} setActiveView={setActiveView}>
          <div className="task-details-page">
            {/* Header */}
            <div className="task-details-header">
              <button className="back-button" onClick={handleBack}>
                <ArrowLeft size={20} />
                <span>Back to Project</span>
              </button>
              
              <div className="task-title-section">
                <h1 className="task-title">{task.title}</h1>
                <div className="task-header-actions">
                  <select 
                    value={task.status} 
                    onChange={(e) => handleStatusChange(e.target.value as any)}
                    className="status-dropdown"
                  >
                    <option value="Todo">Todo</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Meta Chips */}
            <div className="task-meta-chips">
              <span className={`priority-badge ${getPriorityBadgeClass(task.priority)}`}>
                {task.priority}
              </span>
              <span className="type-badge">
                {task.type}
              </span>
              {task.dueAtUtc && (
                <span className="due-date-chip">
                  <Calendar size={14} />
                  Due {formatDate(task.dueAtUtc)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="task-description-card">
              <h2>Description</h2>
              <p>{task.description || "No description"}</p>
            </div>

            {/* Subtasks Section */}
            <div className="subtasks-section">
              <div className="subtasks-header">
                <h2>Subtasks</h2>
                <span className="subtasks-counter">
                  {completedSubtaskCount}/{subtaskCount}
                </span>
              </div>

              {/* Add Subtask */}
              <div className="add-subtask-form">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                  placeholder="Add a subtask..."
                  className="subtask-input"
                  disabled={isAddingSubtask}
                />
                <button 
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim() || isAddingSubtask}
                  className="add-subtask-button"
                >
                  {isAddingSubtask ? (
                    <Loader size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {isAddingSubtask ? 'Adding...' : 'Add'}
                </button>
              </div>

              {/* Subtasks List */}
              <div className="subtasks-list">
                {sortedSubtasks.map((subtask) => (
                  <SubtaskItem
                    key={subtask.subtaskId}
                    subtask={subtask}
                    onToggle={handleToggleSubtask}
                    onEdit={handleEditSubtask}
                    onDelete={handleDeleteSubtask}
                  />
                ))}
                {safeSubtasks.length === 0 && (
                  <div className="empty-subtasks">
                    <p>No subtasks yet — add your first one!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </WorkAreaLayout>
      </div>
      
      <Footer />
    </>
  );
};

export default TaskDetails;
