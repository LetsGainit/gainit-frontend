import React, { useState, useEffect } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import './RequestToJoinModal.css';

interface RequestToJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { requestedRole: string; message?: string }) => Promise<void>;
  availableRoles: string[];
  projectTitle: string;
  loading?: boolean;
}

const RequestToJoinModal: React.FC<RequestToJoinModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableRoles,
  projectTitle,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    requestedRole: '',
    message: ''
  });
  const [errors, setErrors] = useState<{ requestedRole?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ requestedRole: '', message: '' });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { requestedRole?: string } = {};
    
    if (!formData.requestedRole.trim()) {
      newErrors.requestedRole = "Please select a role";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        requestedRole: formData.requestedRole,
        message: formData.message.trim() || undefined
      });
      
      // Reset form on success
      setFormData({ requestedRole: '', message: '' });
      setErrors({});
    } catch (error) {
      // Error handling is done in parent component
      console.error('Request to join failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({ requestedRole: '', message: '' });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  const hasNoRoles = availableRoles.length === 0;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div 
        className="modal-content request-to-join-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="modal-header">
          <h2 id="modal-title">Request to Join Project</h2>
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
          <p id="modal-description" className="modal-description">
            You're requesting to join <strong>{projectTitle}</strong>
          </p>
          
          {hasNoRoles ? (
            <div className="no-roles-message">
              <p>No open roles are currently available for this project.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="requestedRole" className="form-label">
                  Select Role *
                </label>
                <select
                  id="requestedRole"
                  value={formData.requestedRole}
                  onChange={(e) => handleInputChange("requestedRole", e.target.value)}
                  className={`form-select ${errors.requestedRole ? 'error' : ''}`}
                  disabled={isSubmitting}
                  aria-describedby={errors.requestedRole ? "role-error" : undefined}
                >
                  <option value="">Choose a role...</option>
                  {availableRoles.map((role, index) => (
                    <option key={index} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                {errors.requestedRole && (
                  <span id="role-error" className="error-message">
                    {errors.requestedRole}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className="form-textarea"
                  placeholder="Tell the team about yourself and why you want to join this project..."
                  rows={4}
                  disabled={isSubmitting}
                  maxLength={500}
                />
                <div className="character-count">
                  {formData.message.length}/500 characters
                </div>
              </div>

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
                  disabled={isSubmitting || hasNoRoles}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestToJoinModal;
