import React, { useState, useEffect } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import './CreateProjectModal.css';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { selectedRole: string }) => Promise<void>;
  projectTitle: string;
  availableRoles?: string[];
  loading?: boolean;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectTitle,
  availableRoles = [],
  loading = false
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [errors, setErrors] = useState<{ selectedRole?: string }>({});

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setSelectedRole('');
      setErrors({});
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) {
      return;
    }
    // Validate role selection if roles are provided
    if (availableRoles.length > 0 && !selectedRole) {
      setErrors({ selectedRole: 'Please select a role' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({ selectedRole });
    } catch (error) {
      // Error handling is done in parent component
      console.error('Create project failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsSubmitting(false);
    setSelectedRole('');
    setErrors({});
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="modal-content create-project-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="modal-header">
          <h2 id="modal-title">Create a New Project from Template</h2>
          <button 
            className="modal-close-button" 
            onClick={handleCancel}
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="modal-icon">
            <Plus size={48} className="text-indigo-600" />
          </div>
          
          <p id="modal-description" className="modal-description">
            You're about to create a new project based on <strong>{projectTitle}</strong>.
          </p>
          
          <div className="modal-info">
            <p>You will be set as the project owner and responsible for the initial setup and team management.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="modal-form">
            {availableRoles.length > 0 && (
              <div className="form-group">
                <label htmlFor="selectedRole" className="form-label">Select Your Role *</label>
                <select
                  id="selectedRole"
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    if (errors.selectedRole) setErrors({});
                  }}
                  className={`form-select ${errors.selectedRole ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="">Choose a role...</option>
                  {availableRoles.map((role, index) => (
                    <option key={index} value={role}>{role}</option>
                  ))}
                </select>
                {errors.selectedRole && (
                  <span className="error-message">{errors.selectedRole}</span>
                )}
              </div>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || (availableRoles.length > 0 && !selectedRole)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;
