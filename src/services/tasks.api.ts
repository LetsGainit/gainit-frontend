import { v4 as uuidv4 } from 'uuid';

// Define DTOs based on API spec
export interface Subtask {
  subtaskId: string;
  title: string;
  description?: string;
  isDone: boolean;
  orderIndex: number;
  completedAtUtc?: string;
}

export interface Task {
  taskId: string;
  title: string;
  description?: string;
  status: "Todo" | "InProgress" | "Done" | "Blocked";
  priority: "Low" | "Medium" | "High" | "Critical";
  type: "Feature" | "Research" | "Infra" | "Docs" | "Refactor";
  dueAtUtc?: string;
  milestoneTitle?: string;
  subtaskCount: number;
  completedSubtaskCount: number;
  subtasks: Subtask[];
}

export interface CreateSubtaskDto {
  title: string;
  description?: string;
  orderIndex: number;
}

export interface UpdateSubtaskDto {
  title?: string;
  description?: string;
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

// Get a task by ID
export const getTask = async (taskId: string): Promise<Task> => {
  const url = `${BASE_URL}/tasks/${taskId}`;
  const cacheKey = `task-${taskId}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[Tasks API] Using cached data for task ${taskId}`);
    return cached.data;
  }

  const correlationId = uuidv4();
  console.log(`[Tasks API] Fetching task ${taskId} with Correlation ID: ${correlationId}`);

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

    const data = await fetchWithRetry<Task>(url, options);
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`[Tasks API] Error fetching task ${taskId}:`, error);
    throw error;
  }
};

// Get subtasks for a task
export const getSubtasks = async (taskId: string): Promise<Subtask[]> => {
  const url = `${BASE_URL}/tasks/${taskId}/subtasks`;
  const cacheKey = `subtasks-${taskId}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`[Tasks API] Using cached data for subtasks of task ${taskId}`);
    return cached.data;
  }

  const correlationId = uuidv4();
  console.log(`[Tasks API] Fetching subtasks for task ${taskId} with Correlation ID: ${correlationId}`);

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

    const data = await fetchWithRetry<Subtask[]>(url, options);
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`[Tasks API] Error fetching subtasks for task ${taskId}:`, error);
    throw error;
  }
};

// Create a subtask
export const createSubtask = async (taskId: string, dto: CreateSubtaskDto): Promise<Subtask> => {
  const url = `${BASE_URL}/tasks/${taskId}/subtasks`;
  const correlationId = uuidv4();
  console.log(`[Tasks API] Creating subtask for task ${taskId} with Correlation ID: ${correlationId}`);

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

    const data = await fetchWithRetry<Subtask>(url, options);
    
    // Clear cache for this task's subtasks
    cache.delete(`subtasks-${taskId}`);
    cache.delete(`task-${taskId}`);
    
    return data;
  } catch (error) {
    console.error(`[Tasks API] Error creating subtask for task ${taskId}:`, error);
    throw error;
  }
};

// Update a subtask
export const updateSubtask = async (taskId: string, subtaskId: string, dto: UpdateSubtaskDto): Promise<Subtask> => {
  const url = `${BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}`;
  const correlationId = uuidv4();
  console.log(`[Tasks API] Updating subtask ${subtaskId} for task ${taskId} with Correlation ID: ${correlationId}`);

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

    const data = await fetchWithRetry<Subtask>(url, options);
    
    // Clear cache for this task's subtasks
    cache.delete(`subtasks-${taskId}`);
    cache.delete(`task-${taskId}`);
    
    return data;
  } catch (error) {
    console.error(`[Tasks API] Error updating subtask ${subtaskId} for task ${taskId}:`, error);
    throw error;
  }
};

// Toggle subtask completion
export const toggleSubtask = async (taskId: string, subtaskId: string): Promise<Subtask> => {
  const url = `${BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}/toggle`;
  const correlationId = uuidv4();
  console.log(`[Tasks API] Toggling subtask ${subtaskId} for task ${taskId} with Correlation ID: ${correlationId}`);

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
    };

    const data = await fetchWithRetry<Subtask>(url, options);
    
    // Clear cache for this task's subtasks
    cache.delete(`subtasks-${taskId}`);
    cache.delete(`task-${taskId}`);
    
    return data;
  } catch (error) {
    console.error(`[Tasks API] Error toggling subtask ${subtaskId} for task ${taskId}:`, error);
    throw error;
  }
};

// Delete a subtask
export const deleteSubtask = async (taskId: string, subtaskId: string): Promise<void> => {
  const url = `${BASE_URL}/tasks/${taskId}/subtasks/${subtaskId}`;
  const correlationId = uuidv4();
  console.log(`[Tasks API] Deleting subtask ${subtaskId} for task ${taskId} with Correlation ID: ${correlationId}`);

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
    
    // Clear cache for this task's subtasks
    cache.delete(`subtasks-${taskId}`);
    cache.delete(`task-${taskId}`);
  } catch (error) {
    console.error(`[Tasks API] Error deleting subtask ${subtaskId} for task ${taskId}:`, error);
    throw error;
  }
};
