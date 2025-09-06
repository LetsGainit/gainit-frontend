import React, { useState } from "react";
import { X, Send, Loader } from "lucide-react";
import "./NewPostComposer.css";

interface NewPostComposerProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const NewPostComposer: React.FC<NewPostComposerProps> = ({ onSubmit, onCancel, isLoading = false }) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && !isLoading) {
      onSubmit(content.trim());
      setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="new-post-composer">
      <div className="composer-header">
        <div className="composer-author">
          <div className="composer-avatar">
            You
          </div>
          <div className="composer-info">
            <div className="composer-name">You</div>
            <div className="composer-role">Developer</div>
          </div>
        </div>
        
        <button
          onClick={onCancel}
          className="composer-close"
          aria-label="Close composer"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="composer-form">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Share an update, ask a question, or start a discussion..."
          className="composer-textarea"
          rows={3}
          autoFocus
          disabled={isLoading}
        />
        
        <div className="composer-actions">
          <div className="composer-hint">
            Press Ctrl+Enter to post
          </div>
          
          <div className="composer-buttons">
            <button
              type="button"
              onClick={onCancel}
              className="composer-cancel"
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!content.trim() || isLoading}
              className="composer-submit"
            >
              {isLoading ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewPostComposer;
