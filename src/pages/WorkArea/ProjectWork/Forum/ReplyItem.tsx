import React from "react";
import { ThumbsUp, Clock } from "lucide-react";
import { ForumReply } from "../Forum";
import "./ReplyItem.css";

interface ReplyItemProps {
  reply: ForumReply;
  onLike: () => void;
}

const ReplyItem: React.FC<ReplyItemProps> = ({ reply, onLike }) => {
  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  // Linkify URLs in content
  const linkifyContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.split(urlRegex).map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="content-link"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="reply-item">
      <div className="reply-avatar">
        {getInitials(reply.authorName)}
      </div>
      
      <div className="reply-content">
        <div className="reply-header">
          <div className="reply-author">
            <span className="reply-author-name">{reply.authorName}</span>
            <span className="reply-author-role">{reply.authorRole}</span>
          </div>
          <div className="reply-time">
            <Clock size={12} />
            <span>{getRelativeTime(reply.createdAtUtc)}</span>
          </div>
        </div>
        
        <div className="reply-text">
          {linkifyContent(reply.content)}
        </div>
        
        <div className="reply-actions">
          <button
            className={`reply-like-button ${reply.isLikedByCurrentUser ? 'liked' : ''}`}
            onClick={onLike}
            aria-label={`${reply.isLikedByCurrentUser ? 'Unlike' : 'Like'} reply`}
          >
            <ThumbsUp size={12} />
            <span className="reply-like-count">{reply.likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyItem;
