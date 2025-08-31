// API configuration
export const API_CONFIG = {
  // Production API base URL
  PRODUCTION_BASE: "https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/",
  
  // Get the appropriate API base URL
  getBaseUrl: () => {
    // Check for environment variable first
    if (import.meta.env.VITE_API_BASE_URL) {
      console.log("[API] Using environment API base URL:", import.meta.env.VITE_API_BASE_URL);
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    // Fallback to production URL
    console.log("[API] Using production API base URL:", API_CONFIG.PRODUCTION_BASE);
    return API_CONFIG.PRODUCTION_BASE;
  },
  
  // Build full API endpoint URL
  buildUrl: (endpoint) => {
    const baseUrl = API_CONFIG.getBaseUrl();
    // Ensure endpoint starts with 'api/' and base URL ends with '/'
    const cleanBase = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    const cleanEndpoint = endpoint.startsWith('api/') ? endpoint : 'api/' + endpoint;
    return cleanBase + cleanEndpoint;
  }
};

// Common API endpoints
export const API_ENDPOINTS = {
  USERS_ME: () => API_CONFIG.buildUrl('users/me'),
  USERS_ME_ENSURE: () => API_CONFIG.buildUrl('users/me/ensure'),
  GAINER_PROFILE: (userId) => API_CONFIG.buildUrl(`users/gainer/${userId}/profile`),
  MENTOR_PROFILE: (userId) => API_CONFIG.buildUrl(`users/mentor/${userId}/profile`),
  NONPROFIT_PROFILE: (userId) => API_CONFIG.buildUrl(`users/nonprofit/${userId}/profile`),
};
