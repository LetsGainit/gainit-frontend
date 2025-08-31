# API Configuration Guide

## Environment Variables

The application uses environment variables to configure API endpoints. Create a `.env` file in the root directory with the following:

```bash
# API Base URL (optional - will fallback to production if not set)
VITE_API_BASE_URL=https://your-api-domain.com/
```

## Current Configuration

- **Production API**: `https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/`
- **Fallback**: If `VITE_API_BASE_URL` is not set, the app uses the production URL
- **Environment**: All Vite environment variables must start with `VITE_`

## API Endpoints

The application uses centralized API configuration in `src/config/api.js`:

- **User Info**: `/api/users/me`
- **User Ensure**: `/api/users/me/ensure`
- **Gainer Profile**: `/api/users/gainer/{userId}/profile`
- **Mentor Profile**: `/api/users/mentor/{userId}/profile`
- **Nonprofit Profile**: `/api/users/nonprofit/{userId}/profile`

## Debugging

The application now includes comprehensive logging with `[GAINER]` and `[API]` prefixes. Check the browser console for:

- API endpoint URLs being used
- Request/response details
- Error information
- Authentication status

## Troubleshooting

If the form submission fails silently:

1. Check browser console for `[GAINER]` logs
2. Verify network tab for failed requests
3. Check authentication token validity
4. Verify API endpoint accessibility
5. Check CORS configuration on backend
