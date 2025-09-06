import { v4 as uuidv4 } from 'uuid';

// GitHub Stats DTOs
export interface GitHubStats {
  openPullRequests?: number;
  openPRs?: number;
  pullRequests?: {
    open: number;
    closed: number;
    merged: number;
  };
  totalCommits?: number;
  totalContributors?: number;
  lastActivity?: string;
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

// Get GitHub stats for a project
export const getProjectGitHubStats = async (projectId: string): Promise<GitHubStats> => {
  const url = `${BASE_URL}/github/projects/${projectId}/stats`;
  const cacheKey = `github-stats-${projectId}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[GitHub Stats API] Using cached data for project ${projectId}`);
    return cached.data;
  }

  const correlationId = uuidv4();
  console.log(`[GitHub Stats API] Fetching GitHub stats for project ${projectId} with Correlation ID: ${correlationId}`);

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

    const data = await fetchWithRetry<GitHubStats>(url, options);
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`[GitHub Stats API] Error fetching GitHub stats for project ${projectId}:`, error);
    throw error;
  }
};

// Extract open PRs count from stats data
export const getOpenPRsCount = (stats: GitHubStats): number => {
  if (!stats) return 0;
  
  // Try different possible field names
  if (typeof stats.openPullRequests === 'number') {
    return stats.openPullRequests;
  }
  
  if (typeof stats.openPRs === 'number') {
    return stats.openPRs;
  }
  
  if (stats.pullRequests && typeof stats.pullRequests.open === 'number') {
    return stats.pullRequests.open;
  }
  
  return 0;
};
