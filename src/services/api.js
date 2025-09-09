import axios from 'axios';
import { getAccessToken } from '../auth/auth';

const api = axios.create({
  baseURL: 'https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/api',
  timeout: 30000, // 30 second timeout for search operations
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
  async (config) => {
    console.log("🌐 [API] Making request to:", config.method?.toUpperCase(), config.url);
    console.log("🌐 [API] Request config:", {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      data: config.data
    });

    try {
      // Get access token for each request
      const token = await getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("✅ [API] Added Authorization header with token");
      } else {
        console.log("⚠️ [API] No access token available");
      }
    } catch (error) {
      console.error('❌ [API] Failed to get access token:', error);
      // Continue without token - the request will fail with 401 if authentication is required
    }
    return config;
  },
  (error) => {
    console.error('❌ [API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("✅ [API] Response received:", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error("❌ [API] Response error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message
    });

    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("🔄 [API] 401 error, attempting token refresh...");
      originalRequest._retry = true;
      
      try {
        // Try to get a new token
        const token = await getAccessToken();
        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          console.log("✅ [API] Token refreshed, retrying request...");
          return api(originalRequest);
        }
      } catch (tokenError) {
        console.error('❌ [API] Failed to refresh token:', tokenError);
      }
    }
    
    if (error.response?.status === 401) {
      console.error('❌ [API] Authentication failed - user may need to re-authenticate');
    } else if (error.response?.status >= 500) {
      console.error('❌ [API] Server error:', error.response.status, error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
