import { v4 as uuidv4 } from 'uuid';

// Define DTOs based on API spec
export interface Reply {
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
}

export interface Post {
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
  replies: Reply[];
}

export interface CreatePostDto {
  projectId: string;
  content: string;
}

export interface UpdatePostDto {
  content: string;
}

export interface CreateReplyDto {
  postId: string;
  content: string;
}

const BASE_URL = "https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/api";
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

// Helper for exponential backoff
const fetchWithRetry = async <T>(
  url: string,
  options: RequestInit,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        console.warn(`Rate limit hit for ${url}. Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2); // Exponential backoff
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Fetch failed for ${url}:`, error);
    throw error;
  }
};

// Get posts for project
export const getProjectPosts = async (projectId: string): Promise<Post[]> => {
  const url = `${BASE_URL}/forum/projects/${projectId}/posts`;
  const cacheKey = `forum-posts-${projectId}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[Forum API] Using cached data for project posts ${projectId}`);
    return cached.data;
  }

  const correlationId = uuidv4();
  console.log(`[Forum API] Fetching posts for project ${projectId} with Correlation ID: ${correlationId}`);

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const options: RequestInit = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Correlation-ID': correlationId,
        'Content-Type': 'application/json',
      },
    };

    const data = await fetchWithRetry<Post[]>(url, options);
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`[Forum API] Error fetching posts for project ${projectId}:`, error);
    throw error;
  }
};

// Create post
export const createPost = async (dto: CreatePostDto): Promise<Post> => {
  const url = `${BASE_URL}/forum/posts`;
  const correlationId = uuidv4();
  console.log(`[Forum API] Creating post for project ${dto.projectId} with Correlation ID: ${correlationId}`);

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Correlation-ID': correlationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    };

    const data = await fetchWithRetry<Post>(url, options);
    
    // Clear cache for this project's posts
    cache.delete(`forum-posts-${dto.projectId}`);
    
    return data;
  } catch (error) {
    console.error(`[Forum API] Error creating post for project ${dto.projectId}:`, error);
    throw error;
  }
};

// Update post
export const updatePost = async (postId: string, dto: UpdatePostDto): Promise<Post> => {
  const url = `${BASE_URL}/forum/posts/${postId}`;
  const correlationId = uuidv4();
  console.log(`[Forum API] Updating post ${postId} with Correlation ID: ${correlationId}`);

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const options: RequestInit = {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Correlation-ID': correlationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    };

    const data = await fetchWithRetry<Post>(url, options);
    
    // Clear cache for all projects (since we don't know which project this post belongs to)
    // In a real app, you might want to track this more efficiently
    for (const key of cache.keys()) {
      if (key.startsWith('forum-posts-')) {
        cache.delete(key);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`[Forum API] Error updating post ${postId}:`, error);
    throw error;
  }
};

// Delete post
export const deletePost = async (postId: string): Promise<void> => {
  const url = `${BASE_URL}/forum/posts/${postId}`;
  const correlationId = uuidv4();
  console.log(`[Forum API] Deleting post ${postId} with Correlation ID: ${correlationId}`);

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const options: RequestInit = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Correlation-ID': correlationId,
        'Content-Type': 'application/json',
      },
    };

    await fetchWithRetry<void>(url, options);
    
    // Clear cache for all projects
    for (const key of cache.keys()) {
      if (key.startsWith('forum-posts-')) {
        cache.delete(key);
      }
    }
  } catch (error) {
    console.error(`[Forum API] Error deleting post ${postId}:`, error);
    throw error;
  }
};

// Create reply
export const createReply = async (dto: CreateReplyDto): Promise<Reply> => {
  const url = `${BASE_URL}/forum/replies`;
  const correlationId = uuidv4();
  console.log(`[Forum API] Creating reply for post ${dto.postId} with Correlation ID: ${correlationId}`);

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Correlation-ID': correlationId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    };

    const data = await fetchWithRetry<Reply>(url, options);
    
    // Clear cache for all projects
    for (const key of cache.keys()) {
      if (key.startsWith('forum-posts-')) {
        cache.delete(key);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`[Forum API] Error creating reply for post ${dto.postId}:`, error);
    throw error;
  }
};

// Like/unlike post
export const togglePostLike = async (postId: string): Promise<Post> => {
  const url = `${BASE_URL}/forum/posts/${postId}/like`;
  const correlationId = uuidv4();
  console.log(`[Forum API] Toggling like for post ${postId} with Correlation ID: ${correlationId}`);

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Correlation-ID': correlationId,
        'Content-Type': 'application/json',
      },
    };

    const data = await fetchWithRetry<Post>(url, options);
    
    // Clear cache for all projects
    for (const key of cache.keys()) {
      if (key.startsWith('forum-posts-')) {
        cache.delete(key);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`[Forum API] Error toggling like for post ${postId}:`, error);
    throw error;
  }
};

// Like/unlike reply
export const toggleReplyLike = async (replyId: string): Promise<Reply> => {
  const url = `${BASE_URL}/forum/replies/${replyId}/like`;
  const correlationId = uuidv4();
  console.log(`[Forum API] Toggling like for reply ${replyId} with Correlation ID: ${correlationId}`);

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Correlation-ID': correlationId,
        'Content-Type': 'application/json',
      },
    };

    const data = await fetchWithRetry<Reply>(url, options);
    
    // Clear cache for all projects
    for (const key of cache.keys()) {
      if (key.startsWith('forum-posts-')) {
        cache.delete(key);
      }
    }
    
    return data;
  } catch (error) {
    console.error(`[Forum API] Error toggling like for reply ${replyId}:`, error);
    throw error;
  }
};
