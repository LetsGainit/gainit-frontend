import React, { useState } from 'react';
import { X, Github, Link } from 'lucide-react';
import './RepositoryModal.css';

interface RepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  onSave: (repositoryUrl: string) => void;
  loading?: boolean;
  currentUrl?: string;
}

const RepositoryModal: React.FC<RepositoryModalProps> = ({
  isOpen,
  onClose,
  projectName,
  onSave,
  loading = false,
  currentUrl = ''
}) => {
  const [repositoryUrl, setRepositoryUrl] = useState(currentUrl);
  const [error, setError] = useState<string | null>(null);

  const isValidRepoUrl = /^https?:\/\/(www\.)?github\.com\/[^\/\s]+\/[^\/\s#]+\/?$/.test(repositoryUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidRepoUrl) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setError(null);
    onSave(repositoryUrl);
  };

  const handleClose = () => {
    setRepositoryUrl(currentUrl);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="repository-modal-overlay">
      <div className="repository-modal">
        {/* Header */}
        <div className="repository-modal-header">
          <div className="header-content">
            <div className="header-title">
              <Github size={24} className="header-icon" />
              <h2>Connect Repository</h2>
            </div>
            <p className="header-subtitle">{projectName}</p>
          </div>
          <button className="close-button" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="repository-modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>GitHub Repository</h3>
              <p className="form-description">
                Connect your project to a GitHub repository to enable collaboration and version control.
              </p>
              
              <div className="form-group">
                <label htmlFor="repository-url" className="form-label">
                  <Link size={16} className="label-icon" />
                  Repository URL
                </label>
                <input
                  id="repository-url"
                  type="url"
                  value={repositoryUrl}
                  onChange={(e) => {
                    setRepositoryUrl(e.target.value.trim());
                    setError(null);
                  }}
                  placeholder="https://github.com/owner/repository"
                  className={`form-input ${error ? 'error' : ''}`}
                  required
                  disabled={loading}
                />
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}
                <div className="input-hint">
                  Enter the full GitHub repository URL (e.g., https://github.com/username/repository)
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="repository-modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="save-button"
                disabled={!isValidRepoUrl || loading}
              >
                {loading ? (
                  <>
                    <div className="button-spinner"></div>
                    Connecting...
                  </>
                ) : (
                  'Connect Repository'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RepositoryModal;
