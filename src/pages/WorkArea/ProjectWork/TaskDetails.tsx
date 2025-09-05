import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Plus, Edit2, Trash2, GripVertical, Check, X } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import WorkAreaLayout from "../../../components/layout/WorkAreaLayout";
import Footer from "../../../components/Footer";
import SubtaskItem from "./SubtaskItem.tsx";
import "./TaskDetails.css";

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

interface Subtask {
  subtaskId: string;
  title: string;
  isDone: boolean;
  orderIndex: number;
}

const TaskDetails: React.FC = () => {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const { userInfo } = useAuth();
  const navigate = useNavigate();
  
  // Mock task data
  const [task, setTask] = useState<Task>({
    taskId: taskId || "task-1",
    title: "Implement user authentication",
    description: "Create login/registration, password reset, JWT, and role-based access.",
    status: "InProgress",
    priority: "High",
    type: "Feature",
    dueAtUtc: "2025-03-18T00:00:00Z",
    createdAtUtc: "2025-02-20T00:00:00Z",
    projectId: projectId || "temp-1"
  });

  // Mock subtasks data
  const [subtasks, setSubtasks] = useState<Subtask[]>([
    { subtaskId: "s1", title: "Design auth flows", isDone: true, orderIndex: 1 },
    { subtaskId: "s2", title: "Build login/register endpoints", isDone: false, orderIndex: 2 },
    { subtaskId: "s3", title: "JWT issue/verify middleware", isDone: false, orderIndex: 3 },
  ]);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [activeView, setActiveView] = useState("my-projects");

  // Derived counters
  const completedSubtaskCount = subtasks.filter(subtask => subtask.isDone).length;
  const subtaskCount = subtasks.length;

  // Handle back navigation
  const handleBack = () => {
    navigate(`/work/projects/${projectId}`);
  };

  // Handle status change
  const handleStatusChange = (newStatus: "Todo" | "InProgress" | "Blocked" | "Done") => {
    setTask(prev => ({ ...prev, status: newStatus }));
  };

  // Add new subtask
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      subtaskId: `s${Date.now()}`,
      title: newSubtaskTitle.trim(),
      isDone: false,
      orderIndex: Math.max(...subtasks.map(s => s.orderIndex), 0) + 1
    };

    setSubtasks(prev => [...prev, newSubtask]);
    setNewSubtaskTitle("");
  };

  // Toggle subtask completion
  const handleToggleSubtask = (subtaskId: string) => {
    setSubtasks(prev => 
      prev.map(subtask => 
        subtask.subtaskId === subtaskId 
          ? { ...subtask, isDone: !subtask.isDone }
          : subtask
      )
    );
  };

  // Edit subtask title
  const handleEditSubtask = (subtaskId: string, newTitle: string) => {
    setSubtasks(prev => 
      prev.map(subtask => 
        subtask.subtaskId === subtaskId 
          ? { ...subtask, title: newTitle }
          : subtask
      )
    );
  };

  // Delete subtask
  const handleDeleteSubtask = (subtaskId: string) => {
    if (window.confirm("Are you sure you want to delete this subtask?")) {
      setSubtasks(prev => prev.filter(subtask => subtask.subtaskId !== subtaskId));
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

  // Sort subtasks: open first, then done
  const sortedSubtasks = [...subtasks].sort((a, b) => {
    if (a.isDone === b.isDone) {
      return a.orderIndex - b.orderIndex;
    }
    return a.isDone ? 1 : -1;
  });

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
                />
                <button 
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim()}
                  className="add-subtask-button"
                >
                  <Plus size={16} />
                  Add
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
                {subtasks.length === 0 && (
                  <div className="empty-subtasks">
                    <p>No subtasks yet. Add one above to get started!</p>
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
