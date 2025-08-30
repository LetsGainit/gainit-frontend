# Navbar Profile Icon Behavior Update

## Overview

This update implements role-based profile navigation for the Gainit platform navbar. Users can now click the profile icon to access their profile based on their role (Gainer, Mentor, or Nonprofit).

## New Features

### 1. Role-Based Profile Navigation

- **Gainer**: Navigates to `/profile/gainer/{id}`
- **Mentor**: Navigates to `/profile/mentor/{id}`
- **Nonprofit**: Navigates to `/profile/nonprofit/{id}`

### 2. Authentication Flow

- **Unauthenticated users**: Redirected to Azure AD B2C sign-in/sign-up
- **Authenticated users**: Navigate to role-specific profile page
- **Token management**: Automatic token acquisition and refresh

### 3. Error Handling

- Toast notifications for errors
- Graceful fallbacks for unknown roles
- Safe navigation to home page on errors

## Implementation Details

### New Files Created

- `src/hooks/useAuth.js` - Custom hook for authentication state management
- `src/utils/userUtils.js` - Utility functions for role management
- `src/components/Toast.jsx` - Toast notification component
- `src/css/Toast.css` - Toast styling

### Updated Files

- `src/auth/auth.ts` - Added user info and profile fetching functions
- `src/components/PlatformNavBar.jsx` - Updated profile icon behavior
- `src/pages/ProfilePage/ProfilePage.jsx` - Role-based profile rendering
- `src/App.jsx` - Added new profile routes

### Key Functions

#### `getUserInfo()`

- Fetches user information from `/api/users/me` endpoint
- Falls back to MSAL account info if endpoint fails
- Returns user role, ID, and basic information

#### `fetchUserProfile(role, userId)`

- Fetches profile data from role-specific endpoints
- Handles authentication errors gracefully
- Centralized role-to-endpoint mapping

#### `useAuth()` Hook

- Manages authentication state
- Handles token refresh and user data loading
- Provides loading and error states

## API Endpoints

The system now uses these endpoints based on user role:

- **Gainer**: `GET /api/users/gainer/{id}/profile`
- **Mentor**: `GET /api/users/mentor/{id}/profile`
- **Nonprofit**: `GET /api/users/nonprofit/{id}/profile`

## Usage

### In Components

```jsx
import { useAuth } from "../hooks/useAuth";

function MyComponent() {
  const { isAuthenticated, userInfo, profileData, loading, error } = useAuth();

  // Use authentication state and user data
}
```

### Role Validation

```jsx
import { isValidRole, getDisplayNameForRole } from "../utils/userUtils";

if (isValidRole(userRole)) {
  const displayName = getDisplayNameForRole(userRole);
}
```

## Error Handling

### Authentication Errors (401/403)

- Automatically triggers interactive login
- Retries profile fetch after successful authentication

### Unknown Roles

- Shows friendly error message
- Redirects to home page
- Logs error for debugging

### Network Errors

- Graceful fallback to cached data
- User-friendly error messages
- Retry mechanisms

## Security

- Access tokens are automatically acquired and refreshed
- Role-based access control enforced
- Secure token storage using MSAL
- No sensitive data exposed in client-side code

## Testing

To test the implementation:

1. **Unauthenticated user**: Click profile icon → should redirect to login
2. **Authenticated user**: Click profile icon → should navigate to role-specific profile
3. **Different roles**: Test with different user types to verify correct endpoints
4. **Error scenarios**: Test with invalid tokens, network errors, unknown roles

## Future Enhancements

- Role-based UI customization
- Profile editing capabilities
- Advanced permission management
- Real-time profile updates
