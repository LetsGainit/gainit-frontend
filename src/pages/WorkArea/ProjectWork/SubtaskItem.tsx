import React, { useState } from "react";
import { Check, Edit2, Trash2, GripVertical, X } from "lucide-react";
import "./SubtaskItem.css";

interface Subtask {
  subtaskId: string;
  title: string;
  isDone: boolean;
  orderIndex: number;
}

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: (subtaskId: string) => void;
  onEdit: (subtaskId: string, newTitle: string) => void;
  onDelete: (subtaskId: string) => void;
}

const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  onToggle,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subtask.title);

  const handleToggle = () => {
    onToggle(subtask.subtaskId);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(subtask.title);
  };

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onEdit(subtask.subtaskId, editTitle.trim());
    } else {
      setEditTitle(subtask.title);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(subtask.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDelete = () => {
    onDelete(subtask.subtaskId);
  };

  return (
    <div className={`subtask-item ${subtask.isDone ? 'completed' : ''}`}>
      <div className="subtask-content">
        {/* Drag Handle */}
        <div className="subtask-drag-handle">
          <GripVertical size={16} />
        </div>

        {/* Checkbox */}
        <button
          className="subtask-checkbox"
          onClick={handleToggle}
          aria-label={subtask.isDone ? "Mark as incomplete" : "Mark as complete"}
        >
          {subtask.isDone && <Check size={14} />}
        </button>

        {/* Title */}
        <div className="subtask-title-container">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveEdit}
              className="subtask-edit-input"
              autoFocus
            />
          ) : (
            <span 
              className="subtask-title"
              onDoubleClick={handleEdit}
            >
              {subtask.title}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="subtask-actions">
          {isEditing ? (
            <>
              <button
                className="subtask-action-button save"
                onClick={handleSaveEdit}
                aria-label="Save"
              >
                <Check size={14} />
              </button>
              <button
                className="subtask-action-button cancel"
                onClick={handleCancelEdit}
                aria-label="Cancel"
              >
                <X size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                className="subtask-action-button edit"
                onClick={handleEdit}
                aria-label="Edit"
              >
                <Edit2 size={14} />
              </button>
              <button
                className="subtask-action-button delete"
                onClick={handleDelete}
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubtaskItem;
