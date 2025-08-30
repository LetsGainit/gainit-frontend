// Role to endpoint mapping
export const ROLE_ENDPOINTS: Record<string, string> = {
  gainer: 'gainer',
  mentor: 'mentor',
  nonprofit: 'nonprofit',
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  gainer: 'Gainer',
  mentor: 'Mentor',
  nonprofit: 'Nonprofit',
};

// Validate user role
export function isValidRole(role: string | undefined): boolean {
  return role !== undefined && ROLE_ENDPOINTS[role.toLowerCase()] !== undefined;
}

// Get endpoint for role
export function getEndpointForRole(role: string | undefined): string | undefined {
  if (!role) return undefined;
  const normalizedRole = role.toLowerCase();
  return ROLE_ENDPOINTS[normalizedRole];
}

// Get display name for role
export function getDisplayNameForRole(role: string | undefined): string {
  if (!role) return 'User';
  const normalizedRole = role.toLowerCase();
  return ROLE_DISPLAY_NAMES[normalizedRole] || 'User';
}

// Build profile URL for role
export function buildProfileUrl(role: string, userId: string): string {
  const endpoint = getEndpointForRole(role);
  if (!endpoint) {
    throw new Error(`Unknown user role: ${role}`);
  }
  return `/profile/${endpoint}/${userId}`;
}

// Handle authentication errors
export function handleAuthError(error: any, onRetry?: () => void): string {
  if (error.status === 401 || error.status === 403) {
    // Unauthorized or forbidden - trigger re-authentication
    if (onRetry) {
      onRetry();
    }
    return 'Authentication required. Please sign in again.';
  }
  
  if (error.status === 404) {
    return 'Profile not found.';
  }
  
  return error.message || 'An unexpected error occurred.';
}
