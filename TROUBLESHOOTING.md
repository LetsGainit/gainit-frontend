# Troubleshooting Guide

This guide helps you resolve common issues and problems you might encounter while using the Gainit platform.

## 🚨 Quick Fixes

### Page Not Loading
- **Refresh the page** (Ctrl+F5 or Cmd+Shift+R for hard refresh)
- **Clear browser cache** and cookies
- **Check internet connection**
- **Try a different browser**

### Login Issues
- **Verify email and password** are correct
- **Check if account is locked** (too many failed attempts)
- **Clear browser data** and try again
- **Use incognito/private mode**

### Slow Performance
- **Close unnecessary browser tabs**
- **Clear browser cache**
- **Check internet speed**
- **Disable browser extensions** temporarily

## 🔐 Authentication Issues

### Cannot Sign In

**Symptoms:**
- Login button doesn't work
- "Invalid credentials" error
- Redirected back to login page

**Solutions:**

1. **Check Credentials**
   ```bash
   # Verify email format
   user@example.com ✓
   user@example ✗
   ```

2. **Clear Browser Data**
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data
   - Safari: Develop → Empty Caches

3. **Try Different Browser**
   - Test in incognito/private mode
   - Try a different browser entirely

4. **Check Azure AD B2C Status**
   - Visit Azure portal to check service status
   - Contact administrator if service is down

### Role Selection Not Working

**Symptoms:**
- Stuck on role selection page
- Role selection doesn't save
- Redirected to role selection repeatedly

**Solutions:**

1. **Check Network Connection**
   ```javascript
   // Open browser console and check for errors
   console.log('Network status:', navigator.onLine);
   ```

2. **Verify API Endpoint**
   - Check if `VITE_API_BASE_URL` is correctly configured
   - Ensure backend API is accessible

3. **Clear Local Storage**
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

4. **Check User Permissions**
   - Ensure user has proper permissions in Azure AD B2C
   - Contact administrator if needed

### Token Expiration

**Symptoms:**
- "Session expired" messages
- Automatic logout
- API calls failing with 401 errors

**Solutions:**

1. **Automatic Token Refresh**
   - The app should automatically refresh tokens
   - If not working, clear browser data and login again

2. **Manual Token Refresh**
   ```javascript
   // Force token refresh
   window.location.reload();
   ```

3. **Check Token Validity**
   - Open browser DevTools → Application → Local Storage
   - Look for expired tokens

## 🌐 Network and API Issues

### API Calls Failing

**Symptoms:**
- "Network Error" messages
- Data not loading
- 500/502/503 HTTP errors

**Solutions:**

1. **Check API Configuration**
   ```javascript
   // Verify API base URL
   console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
   ```

2. **Test API Connectivity**
   ```bash
   # Test API endpoint
   curl -I https://your-api-domain.com/api/health
   ```

3. **Check CORS Settings**
   - Ensure backend allows requests from your domain
   - Check browser console for CORS errors

4. **Network Troubleshooting**
   ```bash
   # Check DNS resolution
   nslookup your-api-domain.com
   
   # Test connectivity
   ping your-api-domain.com
   ```

### Slow API Responses

**Symptoms:**
- Long loading times
- Timeout errors
- Intermittent failures

**Solutions:**

1. **Check Network Speed**
   - Test internet connection speed
   - Try from different network

2. **Optimize Requests**
   - Reduce data being fetched
   - Implement pagination
   - Use caching where appropriate

3. **Check Server Status**
   - Monitor API response times
   - Check server logs for issues

### Real-time Features Not Working

**Symptoms:**
- SignalR connection fails
- No real-time updates
- Chat not working

**Solutions:**

1. **Check SignalR Connection**
   ```javascript
   // In browser console
   console.log('SignalR connection state:', connection.state);
   ```

2. **Firewall/Proxy Issues**
   - Ensure WebSocket connections are allowed
   - Check corporate firewall settings

3. **Browser Compatibility**
   - Ensure browser supports WebSockets
   - Try different browser

## 🎨 UI and Display Issues

### Styling Problems

**Symptoms:**
- Broken layout
- Missing styles
- Incorrect colors/fonts

**Solutions:**

1. **Clear Browser Cache**
   - Hard refresh (Ctrl+F5)
   - Clear cached images and files

2. **Check CSS Loading**
   ```html
   <!-- Verify CSS files are loading -->
   <link rel="stylesheet" href="/css/App.css">
   ```

3. **Browser Compatibility**
   - Check if browser supports CSS features used
   - Try different browser

### Responsive Design Issues

**Symptoms:**
- Layout broken on mobile
- Elements overlapping
- Text too small/large

**Solutions:**

1. **Check Viewport Meta Tag**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

2. **Test Different Screen Sizes**
   - Use browser DevTools device simulation
   - Test on actual devices

3. **CSS Media Queries**
   ```css
   @media (max-width: 768px) {
     .container {
       padding: 1rem;
     }
   }
   ```

### JavaScript Errors

**Symptoms:**
- Features not working
- Console errors
- App crashes

**Solutions:**

1. **Check Browser Console**
   ```javascript
   // Open DevTools (F12) and check Console tab
   // Look for red error messages
   ```

2. **Common JavaScript Issues**
   ```javascript
   // Check for undefined variables
   console.log('Variable value:', variableName);
   
   // Check for null/undefined objects
   if (object && object.property) {
     // Safe to use
   }
   ```

3. **Browser Compatibility**
   - Ensure browser supports ES6+ features
   - Check for polyfills if needed

## 📱 Mobile-Specific Issues

### Touch Events Not Working

**Symptoms:**
- Buttons not responding to touch
- Scrolling issues
- Gestures not recognized

**Solutions:**

1. **Check Touch Event Handlers**
   ```javascript
   // Ensure touch events are properly bound
   element.addEventListener('touchstart', handleTouch);
   ```

2. **CSS Touch Action**
   ```css
   .touchable {
     touch-action: manipulation;
   }
   ```

3. **Viewport Configuration**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
   ```

### Performance on Mobile

**Symptoms:**
- Slow loading
- Laggy interactions
- High battery usage

**Solutions:**

1. **Optimize Images**
   - Use appropriate image sizes
   - Implement lazy loading
   - Use WebP format when supported

2. **Reduce JavaScript Bundle**
   - Implement code splitting
   - Use service workers for caching

3. **Memory Management**
   - Clean up event listeners
   - Avoid memory leaks

## 🔧 Development Environment Issues

### Build Failures

**Symptoms:**
- `npm run build` fails
- TypeScript errors
- ESLint errors

**Solutions:**

1. **Check Dependencies**
   ```bash
   # Update dependencies
   npm update
   
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **TypeScript Errors**
   ```bash
   # Check TypeScript configuration
   npx tsc --noEmit
   ```

3. **ESLint Issues**
   ```bash
   # Run ESLint with auto-fix
   npm run lint -- --fix
   ```

### Development Server Issues

**Symptoms:**
- `npm run dev` fails
- Hot reload not working
- Port already in use

**Solutions:**

1. **Port Conflicts**
   ```bash
   # Kill process using port 5173
   lsof -ti:5173 | xargs kill -9
   
   # Or use different port
   npm run dev -- --port 3000
   ```

2. **Vite Configuration**
   ```javascript
   // Check vite.config.js
   export default defineConfig({
     server: {
       port: 5173,
       host: true
     }
   });
   ```

3. **Clear Vite Cache**
   ```bash
   # Clear Vite cache
   rm -rf node_modules/.vite
   ```

### Environment Variables

**Symptoms:**
- Environment variables not loading
- API calls failing
- Configuration errors

**Solutions:**

1. **Check .env File**
   ```bash
   # Ensure .env file exists and has correct format
   VITE_API_BASE_URL=https://your-api.com/
   VITE_AZURE_CLIENT_ID=your-client-id
   ```

2. **Variable Naming**
   ```bash
   # Environment variables must start with VITE_
   VITE_API_BASE_URL ✓
   API_BASE_URL ✗
   ```

3. **Restart Development Server**
   ```bash
   # Stop and restart after changing .env
   npm run dev
   ```

## 🐛 Common Bugs and Workarounds

### Infinite Redirect Loop

**Symptoms:**
- Page keeps redirecting
- Browser shows "too many redirects"

**Solutions:**

1. **Check Route Configuration**
   ```jsx
   // Ensure routes are properly configured
   <Route path="/" element={<HomePage />} />
   <Route path="/login" element={<Login />} />
   ```

2. **Clear Browser Data**
   - Clear cookies and local storage
   - Try incognito mode

3. **Check Authentication Logic**
   ```javascript
   // Ensure auth checks don't cause loops
   if (isAuthenticated && path === '/login') {
     navigate('/');
   }
   ```

### Data Not Persisting

**Symptoms:**
- Form data lost on refresh
- Settings not saved
- User preferences reset

**Solutions:**

1. **Check Local Storage**
   ```javascript
   // Verify data is being saved
   localStorage.setItem('key', 'value');
   console.log(localStorage.getItem('key'));
   ```

2. **API Persistence**
   ```javascript
   // Ensure data is saved to backend
   await api.post('/api/user/preferences', preferences);
   ```

3. **State Management**
   ```javascript
   // Use proper state management
   const [preferences, setPreferences] = useState(
    JSON.parse(localStorage.getItem('preferences') || '{}')
  );
   ```

### Memory Leaks

**Symptoms:**
- App becomes slow over time
- Browser crashes
- High memory usage

**Solutions:**

1. **Clean Up Event Listeners**
   ```javascript
   useEffect(() => {
     const handleResize = () => {};
     window.addEventListener('resize', handleResize);
     
     return () => {
       window.removeEventListener('resize', handleResize);
     };
   }, []);
   ```

2. **Clear Intervals/Timeouts**
   ```javascript
   useEffect(() => {
     const interval = setInterval(() => {}, 1000);
     
     return () => {
       clearInterval(interval);
     };
   }, []);
   ```

3. **Unsubscribe from Observables**
   ```javascript
   useEffect(() => {
     const subscription = observable.subscribe();
     
     return () => {
       subscription.unsubscribe();
     };
   }, []);
   ```

## 🔍 Debugging Tools

### Browser DevTools

1. **Console Tab**
   - Check for JavaScript errors
   - Log debugging information
   - Test API calls

2. **Network Tab**
   - Monitor API requests
   - Check response times
   - Identify failed requests

3. **Application Tab**
   - Inspect local storage
   - Check cookies
   - View service workers

### React DevTools

1. **Component Tree**
   - Inspect component hierarchy
   - Check props and state
   - Monitor re-renders

2. **Profiler**
   - Identify performance bottlenecks
   - Monitor component render times
   - Optimize performance

### API Testing Tools

1. **Postman/Insomnia**
   - Test API endpoints directly
   - Verify request/response format
   - Debug authentication issues

2. **curl Commands**
   ```bash
   # Test API endpoint
   curl -X GET "https://api.example.com/users/me" \
        -H "Authorization: Bearer your-token"
   ```

## 📞 Getting Help

### Self-Service Resources

1. **Documentation**
   - Check this troubleshooting guide
   - Review API documentation
   - Read user guide

2. **Community**
   - Search existing issues
   - Ask questions in community forum
   - Share solutions with others

3. **Logs and Diagnostics**
   ```javascript
   // Enable debug logging
   localStorage.setItem('debug', 'true');
   
   // Check browser console for detailed logs
   console.log('Debug info:', debugInfo);
   ```

### Contacting Support

When contacting support, include:

1. **Problem Description**
   - What you were trying to do
   - What actually happened
   - Error messages (if any)

2. **Environment Information**
   - Browser and version
   - Operating system
   - Device type (desktop/mobile)

3. **Steps to Reproduce**
   - Detailed steps to recreate the issue
   - Screenshots or screen recordings
   - Console logs

4. **Additional Context**
   - When the issue started
   - If it's intermittent or consistent
   - Any recent changes

### Support Channels

- **Email**: support@gainit.com
- **Help Center**: [help.gainit.com](https://help.gainit.com)
- **Community Forum**: [community.gainit.com](https://community.gainit.com)
- **GitHub Issues**: For bug reports and feature requests

## 🚀 Performance Optimization

### Slow Loading Times

**Solutions:**

1. **Code Splitting**
   ```javascript
   // Lazy load components
   const ProjectPage = lazy(() => import('./ProjectPage'));
   ```

2. **Image Optimization**
   ```javascript
   // Use optimized images
   <img src="/images/optimized-image.webp" alt="Description" />
   ```

3. **Bundle Analysis**
   ```bash
   # Analyze bundle size
   npm run build -- --analyze
   ```

### Memory Usage

**Solutions:**

1. **Virtual Scrolling**
   - For large lists
   - Reduce DOM nodes

2. **Debouncing**
   ```javascript
   // Debounce search input
   const debouncedSearch = useMemo(
     () => debounce(searchFunction, 300),
     []
   );
   ```

3. **Memoization**
   ```javascript
   // Memoize expensive calculations
   const expensiveValue = useMemo(() => {
     return heavyCalculation(data);
   }, [data]);
   ```

## 🔒 Security Considerations

### Data Protection

1. **Sensitive Information**
   - Never log sensitive data
   - Use secure storage for tokens
   - Validate user input

2. **HTTPS**
   - Ensure all connections use HTTPS
   - Check certificate validity
   - Use secure cookies

3. **Authentication**
   - Implement proper token refresh
   - Handle token expiration
   - Secure token storage

This troubleshooting guide should help you resolve most common issues. If you encounter a problem not covered here, please contact our support team with detailed information about the issue.
