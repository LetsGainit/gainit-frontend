import axios from 'axios';

// Public API instance without authentication
const publicApi = axios.create({
  baseURL: 'https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/api',
  timeout: 30000, // 30 second timeout for search operations
});

// Request interceptor for logging (no auth)
publicApi.interceptors.request.use(
  (config) => {
    console.log("🌐 [PUBLIC API] Making request to:", config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ [PUBLIC API] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
publicApi.interceptors.response.use(
  (response) => {
    console.log("✅ [PUBLIC API] Response received:", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
    });
    return response;
  },
  (error) => {
    console.error("❌ [PUBLIC API] Response error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default publicApi;
