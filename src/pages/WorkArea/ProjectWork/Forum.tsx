import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { 
  MessageSquare, 
  Plus, 
  Search, 
  MoreHorizontal, 
  ThumbsUp, 
  Reply, 
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertCircle
} from "lucide-react";
import PostCard from "./Forum/PostCard";
import NewPostComposer from "./Forum/NewPostComposer";
import { 
  getProjectPosts, 
  createPost, 
  updatePost, 
  deletePost, 
  createReply, 
  togglePostLike, 
  toggleReplyLike,
  Post,
  Reply as ForumReply,
  CreatePostDto,
  UpdatePostDto,
  CreateReplyDto
} from "../../../services/forum.api";
import "./Forum.css";

// Use imported types directly, no need for re-export

const Forum: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { userInfo, loading: authLoading } = useAuth();
  
  // Local state
  const [posts, setPosts] = useState<Post[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "top" | "replies">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    if (!projectId || !userInfo?.userId) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`[FORUM] Fetching posts for project ${projectId}`);
      const postsData = await getProjectPosts(projectId);
      setPosts(postsData);
      console.log(`[FORUM] Successfully fetched ${postsData.length} posts for project ${projectId}`);
    } catch (err) {
      console.error(`[FORUM] Error fetching posts:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [projectId, userInfo?.userId]);

  // Load posts on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, userInfo?.userId]);

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
  const handleCreatePost = async (content: string) => {
    if (!projectId || isCreatingPost) return;

    setIsCreatingPost(true);
    try {
      const dto: CreatePostDto = {
        projectId,
        content
      };

      console.log(`[FORUM] Creating post for project ${projectId}`);
      const newPost = await createPost(dto);
      setPosts(prev => [newPost, ...prev]);
      setShowNewPost(false);
      console.log(`[FORUM] Successfully created post:`, newPost);
    } catch (err) {
      console.error(`[FORUM] Error creating post:`, err);
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      console.log(`[FORUM] Toggling like for post ${postId}`);
      const updatedPost = await togglePostLike(postId);
      setPosts(prev => prev.map(post => 
        post.postId === postId ? updatedPost : post
      ));
      console.log(`[FORUM] Successfully toggled like for post:`, updatedPost);
    } catch (err) {
      console.error(`[FORUM] Error toggling like for post:`, err);
      setError(err instanceof Error ? err.message : 'Failed to toggle like');
    }
  };

  const handleToggleReplies = (postId: string) => {
    // This will be handled by PostCard component
  };

  const handleCreateReply = async (postId: string, content: string) => {
    try {
      const dto: CreateReplyDto = {
        postId,
        content
      };

      console.log(`[FORUM] Creating reply for post ${postId}`);
      const newReply = await createReply(dto);
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
      console.log(`[FORUM] Successfully created reply:`, newReply);
    } catch (err) {
      console.error(`[FORUM] Error creating reply:`, err);
      setError(err instanceof Error ? err.message : 'Failed to create reply');
    }
  };

  const handleLikeReply = async (postId: string, replyId: string) => {
    try {
      console.log(`[FORUM] Toggling like for reply ${replyId}`);
      const updatedReply = await toggleReplyLike(replyId);
      setPosts(prev => prev.map(post => {
        if (post.postId === postId) {
          return {
            ...post,
            replies: post.replies?.map(reply => 
              reply.replyId === replyId ? updatedReply : reply
            )
          };
        }
        return post;
      }));
      console.log(`[FORUM] Successfully toggled like for reply:`, updatedReply);
    } catch (err) {
      console.error(`[FORUM] Error toggling like for reply:`, err);
      setError(err instanceof Error ? err.message : 'Failed to toggle like');
    }
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

  // Error state
  const renderError = () => (
    <div className="forum-error">
      <div className="error-card">
        <AlertCircle size={48} className="error-icon" />
        <h3>Unable to load posts</h3>
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={fetchPosts}
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Empty state
  const renderEmpty = () => (
    <div className="forum-empty">
      <div className="empty-card">
        <MessageSquare size={48} className="empty-icon" />
        <h3>No posts yet — start the conversation!</h3>
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

  // Show loading state while authentication is loading
  if (authLoading || !userInfo?.userId) {
    return (
      <div className="forum-container">
        <div className="forum-loading">
          <div className="loading-spinner"></div>
          <p>Loading forum...</p>
        </div>
      </div>
    );
  }

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
          isLoading={isCreatingPost}
        />
      )}

      {/* Posts List */}
      <div className="forum-content">
        {loading ? (
          renderSkeleton()
        ) : error ? (
          renderError()
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
