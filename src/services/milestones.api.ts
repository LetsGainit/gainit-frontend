import { v4 as uuidv4 } from 'uuid';

// Milestone DTOs
export interface Milestone {
  milestoneId: string;
  title: string;
  description?: string;
  status: 'Planned' | 'Active' | 'Completed';
  tasksCount: number;
  doneTasksCount: number;
  orderIndex: number;
  targetDateUtc: string;
}

export interface CreateMilestoneDto {
  title: string;
  description?: string;
  targetDateUtc: string;
}

export interface UpdateMilestoneDto {
  title?: string;
  description?: string;
  targetDateUtc?: string;
}

export type MilestoneStatus = 'Planned' | 'Active' | 'Completed';

// API Configuration
const API_BASE_URL = 'https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net';

// Cache for API responses (2 minutes)
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

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
        throw new Error('Milestone not found.');
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

// Get all milestones for a project
export const getMilestones = async (projectId: string): Promise<Milestone[]> => {
  const cacheKey = `milestones-${projectId}`;
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const response = await makeApiCall(`/api/milestones?projectId=${projectId}`);
  const data = await response.json();
  
  apiCache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

// Get single milestone
export const getMilestone = async (milestoneId: string): Promise<Milestone> => {
  const response = await makeApiCall(`/api/milestones/${milestoneId}`);
  return response.json();
};

// Create milestone
export const createMilestone = async (dto: CreateMilestoneDto): Promise<Milestone> => {
  const response = await makeApiCall('/api/milestones', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  
  const data = await response.json();
  
  // Clear cache for all projects (since we don't know which project this belongs to)
  clearAllCache();
  
  return data;
};

// Update milestone
export const updateMilestone = async (milestoneId: string, dto: UpdateMilestoneDto): Promise<Milestone> => {
  const response = await makeApiCall(`/api/milestones/${milestoneId}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
  
  const data = await response.json();
  
  // Clear cache for all projects
  clearAllCache();
  
  return data;
};

// Update milestone status
export const updateMilestoneStatus = async (milestoneId: string, status: MilestoneStatus): Promise<Milestone> => {
  const response = await makeApiCall(`/api/milestones/${milestoneId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
  
  const data = await response.json();
  
  // Clear cache for all projects
  clearAllCache();
  
  return data;
};

// Delete milestone
export const deleteMilestone = async (milestoneId: string): Promise<void> => {
  await makeApiCall(`/api/milestones/${milestoneId}`, {
    method: 'DELETE',
  });
  
  // Clear cache for all projects
  clearAllCache();
};

// Clear cache for a specific project
export const clearProjectCache = (projectId: string) => {
  apiCache.delete(`milestones-${projectId}`);
};

// Clear all cache
export const clearAllCache = () => {
  apiCache.clear();
};
