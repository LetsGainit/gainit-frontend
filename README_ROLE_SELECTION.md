# Role Selection Feature Implementation

## Overview

This document describes the implementation of the Role Selection step that appears immediately after a new user registers via Azure AD B2C.

## Components Created

### 1. ChooseRole Page (`src/pages/ChooseRole/ChooseRole.jsx`)

- **Purpose**: Displays three role options for new users to select from
- **Features**:
  - 3-column responsive grid layout (Tailwind CSS grid)
  - Interactive role cards with hover effects
  - Form validation and submission
  - Toast notifications for success/error feedback
  - Automatic navigation to profile setup after role selection

### 2. RoleCheck Component (`src/components/RoleCheck.jsx`)

- **Purpose**: Automatically redirects users based on their role status
- **Logic**:
  - If user has no role → redirect to `/choose-role`
  - If user has role but is on role selection page → redirect to profile
  - Shows loading state while checking user role

### 3. Users Service (`src/services/usersService.js`)

- **Purpose**: Handles user-related API calls
- **Functions**:
  - `updateUserRole(userId, role)`: Updates user's role via PATCH API
  - `getUserById(userId)`: Retrieves user information

## Routing & Flow

### New Route Added

- `/choose-role` → ChooseRole component

### Automatic Redirects

1. **After Azure AD B2C login**: User is redirected to role selection if no role is defined
2. **Role selection**: User selects one of three roles (Gainer, Mentor, Non-Profit)
3. **API call**: Role is saved to backend via `PATCH /api/users/{id}/role`
4. **Profile setup**: User is automatically navigated to profile setup form

## Role Options

### 1. Gainer

- **Description**: "I want to gain real-world experience through projects"
- **Target**: Students and early-career professionals

### 2. Mentor

- **Description**: "I want to guide and support others in their journey"
- **Target**: Experienced professionals

### 3. Non-Profit

- **Description**: "I represent an organization seeking tech solutions and collaboration"
- **Target**: Organizations looking for tech solutions

## Styling & Design

### Typography

- **Font**: Poppins (imported from Google Fonts)
- **Consistent**: Applied to all text elements (titles, descriptions, buttons)

### Color Scheme

- **Primary**: Purple (#6366f1) - brand color
- **Background**: White (#ffffff)
- **Text**: Dark gray (#1f2937) for titles, medium gray (#6b7280) for descriptions

### Responsive Design

- **Desktop**: 3-column grid
- **Tablet**: 2-column grid
- **Mobile**: 1-column grid

### Interactive Elements

- **Hover Effects**: Cards turn purple with white text
- **Selection State**: Visual feedback with checkmark overlay
- **Smooth Transitions**: 0.3s ease transitions for all interactions

## API Integration

### Endpoint

```
PATCH /api/users/{id}/role
```

### Request Body

```json
{
  "role": "gainer" | "mentor" | "nonprofit"
}
```

### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

## Error Handling

### API Failures

- Toast notifications for clear error messages
- Graceful fallback with user-friendly error text
- Console logging for debugging

### User Experience

- Loading states during API calls
- Disabled submit button until role is selected
- Success feedback before navigation

## Security Considerations

### Authentication

- RoleCheck component ensures authenticated access
- Automatic token inclusion via API interceptors
- Redirect protection for unauthenticated users

### Authorization

- Users can only update their own role
- Backend validation of role values
- Secure token-based authentication

## Testing

### Manual Testing Scenarios

1. **New User Flow**: Login → Role Selection → Profile Setup
2. **Existing User Flow**: Login → Direct to Profile (if role exists)
3. **Error Handling**: Network failures, invalid responses
4. **Responsive Design**: Different screen sizes and orientations

### Component Testing

- Role selection functionality
- Form validation
- API integration
- Navigation flows
- Error handling

## Future Enhancements

### Potential Improvements

1. **Role Descriptions**: More detailed role information
2. **Multi-step Setup**: Additional onboarding steps
3. **Role Switching**: Allow users to change roles later
4. **Analytics**: Track role selection patterns
5. **A/B Testing**: Different role descriptions or layouts

## Dependencies

### Required Packages

- `react-router-dom`: Navigation and routing
- `axios`: HTTP client for API calls
- `lucide-react`: Icons (checkmark for selection)

### Internal Dependencies

- `useAuth` hook: Authentication state management
- `Toast` component: User feedback
- `LoadingIllustration`: Loading states
- `api` service: HTTP request configuration

## File Structure

```
src/
├── pages/
│   └── ChooseRole/
│       ├── ChooseRole.jsx
│       └── ChooseRole.css
├── components/
│   └── RoleCheck.jsx
└── services/
    └── usersService.js
```

## Usage

### For Developers

1. Import `RoleCheck` component in your main App component
2. Wrap your routes with `RoleCheck` for automatic role-based routing
3. Use `updateUserRole` service function for role updates

### For Users

1. Complete Azure AD B2C authentication
2. Select appropriate role from three options
3. Click "Continue to Profile Setup"
4. Complete profile information

## Troubleshooting

### Common Issues

1. **Role not saving**: Check API endpoint and authentication
2. **Infinite redirects**: Verify RoleCheck logic and user state
3. **Styling issues**: Ensure Poppins font is loaded
4. **API errors**: Check network connectivity and token validity

### Debug Information

- Console logs for API calls and redirects
- Network tab for API request/response details
- React DevTools for component state inspection
