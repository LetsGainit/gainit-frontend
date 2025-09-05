import React, { useState } from "react";
import { X, Send } from "lucide-react";
import "./ReplyComposer.css";

interface ReplyComposerProps {
  onSubmit: (content: string) => void;
  onCancel: () => void;
}

const ReplyComposer: React.FC<ReplyComposerProps> = ({ onSubmit, onCancel }) => {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content.trim());
      setContent("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="reply-composer">
      <div className="reply-composer-avatar">
        You
      </div>
      
      <form onSubmit={handleSubmit} className="reply-composer-form">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a reply..."
          className="reply-composer-input"
          rows={2}
          autoFocus
        />
        
        <div className="reply-composer-actions">
          <button
            type="button"
            onClick={onCancel}
            className="reply-composer-cancel"
          >
            <X size={16} />
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={!content.trim()}
            className="reply-composer-submit"
          >
            <Send size={16} />
            Reply
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReplyComposer;
