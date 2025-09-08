import { v4 as uuidv4 } from 'uuid';

// GitHub API DTOs
export interface Repository {
  fullName: string;
  description?: string;
  primaryLanguage?: string;
  languages: string[];
  starsCount: number;
  forksCount: number;
  isPublic: boolean;
  url: string;
}

export interface SyncStatus {
  isRunning: boolean;
  status: 'idle' | 'running' | 'completed' | 'failed';
  message?: string;
  lastSyncTime?: string;
  error?: string;
}

export interface Contribution {
  username: string;
  avatarUrl: string;
  commits: number;
  pullRequests?: number;
  codeReviews?: number;
  githubUrl: string;
}

export interface ValidateUrlRequest {
  url: string;
}

export interface ValidateUrlResponse {
  isValid: boolean;
  message?: string;
  repositoryName?: string;
}

export interface LinkRepositoryRequest {
  repositoryUrl: string;
}

// API Configuration
const API_BASE_URL = 'https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net';

// Cache for API responses (5 minutes)
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get auth token from localStorage or context
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
  if (token) return token;
  return null;
};

// Exponential backoff for 429 errors
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429 && retries > 0) {
      // Exponential backoff: 1s, 2s, 4s
      const backoffMs = Math.pow(2, 3 - retries) * 1000;
      await delay(backoffMs);
      return fetchWithRetry(url, options, retries - 1);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      const backoffMs = Math.pow(2, 3 - retries) * 1000;
      await delay(backoffMs);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

const makeApiCall = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required. Please sign in.');
  }

  const correlationId = uuidv4();
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Correlation-ID': correlationId,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    switch (response.status) {
      case 401:
        throw new Error('Authentication expired. Please sign in again.');
      case 403:
        throw new Error('Access denied. You do not have permission to access this resource.');
      case 404:
        throw new Error('Repository not found. It may have been removed or made private.');
      case 429:
        throw new Error('Too many requests. Please try again in a moment.');
      case 500:
      case 502:
      case 503:
      case 504:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error(`Request failed: ${response.status}`);
    }
  }

  return response;
};

// Get linked repository for a project
export const getProjectRepository = async (projectId: string): Promise<Repository> => {
  const cacheKey = `repo-${projectId}`;
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const response = await makeApiCall(`/api/github/projects/${projectId}/repository`);
  const data = await response.json();
  
  apiCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

// Validate repository URL
export const validateRepoUrl = async (url: string): Promise<ValidateUrlResponse> => {
  const response = await makeApiCall('/api/github/validate-url', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
  
  return response.json();
};

// Link repository to project
export const linkProjectRepository = async (projectId: string, repositoryUrl: string): Promise<void> => {
  await makeApiCall(`/api/projects/${projectId}/repository`, {
    method: 'PUT',
    // Send raw URL as text/plain per backend contract
    body: repositoryUrl,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
  
  // Clear cache for this project
  apiCache.delete(`repo-${projectId}`);
  apiCache.delete(`contributions-${projectId}`);
};

// Trigger repository sync
export const syncRepository = async (projectId: string): Promise<void> => {
  await makeApiCall(`/api/github/projects/${projectId}/sync`, {
    method: 'POST',
  });
};

// Get sync status
export const getSyncStatus = async (projectId: string): Promise<SyncStatus> => {
  const response = await makeApiCall(`/api/github/projects/${projectId}/sync-status`);
  return response.json();
};

// Get project contributions
export const getProjectContributions = async (projectId: string): Promise<Contribution[]> => {
  const cacheKey = `contributions-${projectId}`;
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const response = await makeApiCall(`/api/github/projects/${projectId}/contributions`);
  const data = await response.json();
  
  apiCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

// Clear cache for a specific project
export const clearProjectCache = (projectId: string) => {
  apiCache.delete(`repo-${projectId}`);
  apiCache.delete(`contributions-${projectId}`);
};

// Clear all cache
export const clearAllCache = () => {
  apiCache.clear();
};
