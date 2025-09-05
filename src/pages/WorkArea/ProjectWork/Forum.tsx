import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  MoreHorizontal, 
  ThumbsUp, 
  Reply, 
  Share2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import PostCard from "./Forum/PostCard";
import NewPostComposer from "./Forum/NewPostComposer";
import "./Forum.css";

export type ForumReply = {
  replyId: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
  likeCount: number;
  isLikedByCurrentUser: boolean;
};

export type ForumPost = {
  postId: string;
  projectId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
  likeCount: number;
  replyCount: number;
  isLikedByCurrentUser: boolean;
  replies?: ForumReply[];
};

const Forum: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  // Local state
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      postId: "post-1",
      projectId: projectId || "temp-1",
      authorId: "user-1",
      authorName: "John Doe",
      authorRole: "Frontend Developer",
      content: "Hey team! I've been working on the authentication flow and wanted to get everyone's thoughts on the UX. Should we go with a two-step verification or keep it simple with just email/password?",
      createdAtUtc: "2024-01-20T10:30:00Z",
      likeCount: 5,
      replyCount: 3,
      isLikedByCurrentUser: false,
      replies: [
        {
          replyId: "reply-1",
          postId: "post-1",
          authorId: "user-2",
          authorName: "Jane Smith",
          authorRole: "Backend Developer",
          content: "I think two-step would be great for security, especially since we're handling user data. We could implement it as optional initially.",
          createdAtUtc: "2024-01-20T11:15:00Z",
          likeCount: 2,
          isLikedByCurrentUser: true
        },
        {
          replyId: "reply-2",
          postId: "post-1",
          authorId: "user-3",
          authorName: "Mike Johnson",
          authorRole: "UI/UX Designer",
          content: "Agreed with Jane. We could also add social login options to reduce friction for users who prefer that.",
          createdAtUtc: "2024-01-20T12:00:00Z",
          likeCount: 1,
          isLikedByCurrentUser: false
        }
      ]
    },
    {
      postId: "post-2",
      projectId: projectId || "temp-1",
      authorId: "user-2",
      authorName: "Jane Smith",
      authorRole: "Backend Developer",
      content: "Quick update: The API endpoints for user management are ready for testing. Please check the documentation in the project wiki and let me know if you encounter any issues.",
      createdAtUtc: "2024-01-19T14:20:00Z",
      likeCount: 3,
      replyCount: 1,
      isLikedByCurrentUser: true,
      replies: [
        {
          replyId: "reply-3",
          postId: "post-2",
          authorId: "user-1",
          authorName: "John Doe",
          authorRole: "Frontend Developer",
          content: "Thanks Jane! I'll test them out this afternoon.",
          createdAtUtc: "2024-01-19T15:30:00Z",
          likeCount: 0,
          isLikedByCurrentUser: false
        }
      ]
    },
    {
      postId: "post-3",
      projectId: projectId || "temp-1",
      authorId: "user-3",
      authorName: "Mike Johnson",
      authorRole: "UI/UX Designer",
      content: "I've uploaded the latest wireframes for the dashboard. The new layout should improve navigation and make better use of screen space. Feedback welcome!",
      createdAtUtc: "2024-01-18T09:45:00Z",
      likeCount: 7,
      replyCount: 0,
      isLikedByCurrentUser: false,
      replies: []
    }
  ]);

  const [sortBy, setSortBy] = useState<"newest" | "top" | "replies">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = posts.filter(post => 
        post.content.toLowerCase().includes(query) ||
        post.authorName.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime();
        case "top":
          return b.likeCount - a.likeCount;
        case "replies":
          return b.replyCount - a.replyCount;
        default:
          return 0;
      }
    });

    return sorted;
  }, [posts, searchQuery, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPosts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPosts = filteredAndSortedPosts.slice(startIndex, startIndex + pageSize);

  // Handlers
  const handleCreatePost = (content: string) => {
    const newPost: ForumPost = {
      postId: crypto.randomUUID(),
      projectId: projectId || "temp-1",
      authorId: "current-user",
      authorName: "You",
      authorRole: "Developer",
      content,
      createdAtUtc: new Date().toISOString(),
      likeCount: 0,
      replyCount: 0,
      isLikedByCurrentUser: false,
      replies: []
    };

    setPosts(prev => [newPost, ...prev]);
    setShowNewPost(false);
  };

  const handleToggleLike = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.postId === postId) {
        const isLiked = post.isLikedByCurrentUser;
        return {
          ...post,
          isLikedByCurrentUser: !isLiked,
          likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1
        };
      }
      return post;
    }));
  };

  const handleToggleReplies = (postId: string) => {
    // This will be handled by PostCard component
  };

  const handleCreateReply = (postId: string, content: string) => {
    const newReply: ForumReply = {
      replyId: crypto.randomUUID(),
      postId,
      authorId: "current-user",
      authorName: "You",
      authorRole: "Developer",
      content,
      createdAtUtc: new Date().toISOString(),
      likeCount: 0,
      isLikedByCurrentUser: false
    };

    setPosts(prev => prev.map(post => {
      if (post.postId === postId) {
        return {
          ...post,
          replies: [...(post.replies || []), newReply],
          replyCount: post.replyCount + 1
        };
      }
      return post;
    }));
  };

  const handleLikeReply = (postId: string, replyId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.postId === postId) {
        return {
          ...post,
          replies: post.replies?.map(reply => {
            if (reply.replyId === replyId) {
              const isLiked = reply.isLikedByCurrentUser;
              return {
                ...reply,
                isLikedByCurrentUser: !isLiked,
                likeCount: isLiked ? reply.likeCount - 1 : reply.likeCount + 1
              };
            }
            return reply;
          })
        };
      }
      return post;
    }));
  };

  const handleSortChange = (newSort: "newest" | "top" | "replies") => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="forum-skeleton">
      {[1, 2, 3].map((i) => (
        <div key={i} className="post-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-meta">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
          <div className="skeleton-content">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
          <div className="skeleton-actions">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const renderEmpty = () => (
    <div className="forum-empty">
      <div className="empty-card">
        <MessageSquare size={48} className="empty-icon" />
        <h3>No posts yet</h3>
        <p>Be the first to start a discussion in this project's forum.</p>
        <button 
          className="empty-action-button"
          onClick={() => setShowNewPost(true)}
        >
          <Plus size={16} />
          Create First Post
        </button>
      </div>
    </div>
  );

  return (
    <div className="forum-container">
      {/* Header */}
      <div className="forum-header">
        <div className="forum-title-section">
          <MessageSquare size={20} className="forum-icon" />
          <h1 className="forum-title">Forum</h1>
        </div>
        
        <div className="forum-actions">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search posts…"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as any)}
            className="sort-select"
          >
            <option value="newest">Newest</option>
            <option value="top">Top (likes)</option>
            <option value="replies">Most replies</option>
          </select>
          
          <button
            className="new-post-button"
            onClick={() => setShowNewPost(true)}
          >
            <Plus size={16} />
            New Post
          </button>
        </div>
      </div>

      {/* New Post Composer */}
      {showNewPost && (
        <NewPostComposer
          onSubmit={handleCreatePost}
          onCancel={() => setShowNewPost(false)}
        />
      )}

      {/* Posts List */}
      <div className="forum-content">
        {loading ? (
          renderSkeleton()
        ) : paginatedPosts.length === 0 ? (
          renderEmpty()
        ) : (
          <div className="posts-list">
            {paginatedPosts.map((post) => (
              <PostCard
                key={post.postId}
                post={post}
                onToggleLike={handleToggleLike}
                onToggleReplies={handleToggleReplies}
                onCreateReply={handleCreateReply}
                onLikeReply={handleLikeReply}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredAndSortedPosts.length > 0 && (
          <div className="forum-pagination">
            <div className="pagination-info">
              <span>
                Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredAndSortedPosts.length)} of {filteredAndSortedPosts.length} posts
              </span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="page-size-select"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
              </select>
            </div>
            
            <div className="pagination-controls">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <div className="page-indicator">
                Page {currentPage} of {totalPages}
              </div>
              
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Forum;
