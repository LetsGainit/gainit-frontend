import axios from 'axios';
import { getAccessToken } from '../auth/auth';

const api = axios.create({
  baseURL: 'https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/api',
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  async (config) => {
    try {
      // Get access token for each request
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Failed to get access token:', error);
      // Continue without token - the request will fail with 401 if authentication is required
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to get a new token
        const token = await getAccessToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (tokenError) {
        console.error('Failed to refresh token:', tokenError);
      }
    }
    
    if (error.response?.status === 401) {
      console.error('Authentication failed - user may need to re-authenticate');
    } else if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status, error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
