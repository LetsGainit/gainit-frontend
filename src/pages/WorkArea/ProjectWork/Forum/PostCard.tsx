import React, { useState } from "react";
import { 
  MoreHorizontal, 
  ThumbsUp, 
  Reply, 
  Share2,
  Clock
} from "lucide-react";
import { ForumPost, ForumReply } from "../Forum";
import ReplyItem from "./ReplyItem";
import ReplyComposer from "./ReplyComposer";
import "./PostCard.css";

interface PostCardProps {
  post: ForumPost;
  onToggleLike: (postId: string) => void;
  onToggleReplies: (postId: string) => void;
  onCreateReply: (postId: string, content: string) => void;
  onLikeReply: (postId: string, replyId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onToggleLike,
  onToggleReplies,
  onCreateReply,
  onLikeReply
}) => {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyComposer, setShowReplyComposer] = useState(false);

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

  const handleToggleReplies = () => {
    setShowReplies(!showReplies);
    onToggleReplies(post.postId);
  };

  const handleCreateReply = (content: string) => {
    onCreateReply(post.postId, content);
    setShowReplyComposer(false);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/work/projects/${post.projectId}/forum/${post.postId}`;
    navigator.clipboard.writeText(url);
    // TODO: Show toast notification
  };

  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {getInitials(post.authorName)}
          </div>
          <div className="author-info">
            <div className="author-name">{post.authorName}</div>
            <div className="author-role">{post.authorRole}</div>
          </div>
        </div>
        
        <div className="post-meta">
          <div className="post-time">
            <Clock size={14} />
            <span>{getRelativeTime(post.createdAtUtc)}</span>
          </div>
          <button className="post-menu-button" aria-label="More options">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="post-content">
        {linkifyContent(post.content)}
      </div>

      {/* Actions */}
      <div className="post-actions">
        <button
          className={`action-button ${post.isLikedByCurrentUser ? 'liked' : ''}`}
          onClick={() => onToggleLike(post.postId)}
          aria-label={`${post.isLikedByCurrentUser ? 'Unlike' : 'Like'} post`}
        >
          <ThumbsUp size={16} />
          <span className="action-count">{post.likeCount}</span>
        </button>

        <button
          className="action-button"
          onClick={handleToggleReplies}
          aria-label="Toggle replies"
        >
          <Reply size={16} />
          <span className="action-count">{post.replyCount}</span>
        </button>

        <button
          className="action-button"
          onClick={handleCopyLink}
          aria-label="Copy link"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Replies Section */}
      {showReplies && (
        <div className="replies-section">
          {/* Reply Composer */}
          {showReplyComposer ? (
            <ReplyComposer
              onSubmit={handleCreateReply}
              onCancel={() => setShowReplyComposer(false)}
            />
          ) : (
            <button
              className="reply-composer-toggle"
              onClick={() => setShowReplyComposer(true)}
            >
              <div className="reply-avatar">
                {getInitials("You")}
              </div>
              <span className="reply-placeholder">Reply to this post...</span>
            </button>
          )}

          {/* Replies List */}
          {post.replies && post.replies.length > 0 && (
            <div className="replies-list">
              {post.replies.map((reply) => (
                <ReplyItem
                  key={reply.replyId}
                  reply={reply}
                  onLike={() => onLikeReply(post.postId, reply.replyId)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
