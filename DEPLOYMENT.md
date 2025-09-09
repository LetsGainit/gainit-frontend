# Deployment Guide

This guide covers deploying the Gainit frontend application to Azure Static Web Apps and other hosting platforms.

## 🚀 Azure Static Web Apps Deployment

### Prerequisites

- Azure subscription
- GitHub repository with the code
- Azure CLI (optional, for local deployment)
- Node.js and npm installed

### Method 1: GitHub Actions (Recommended)

1. **Create Azure Static Web App**
   - Go to [Azure Portal](https://portal.azure.com)
   - Create a new Static Web App resource
   - Connect to your GitHub repository
   - Configure build settings:
     - **App location**: `/`
     - **API location**: (leave empty for frontend-only)
     - **Output location**: `dist`

2. **Configure GitHub Actions**
   The deployment workflow is automatically created. Review the generated `.github/workflows/azure-static-web-apps-*.yml` file:

   ```yaml
   name: Azure Static Web Apps CI/CD
   
   on:
     push:
       branches:
         - main
     pull_request:
       types: [opened, synchronize, reopened, closed]
       branches:
         - main
   
   jobs:
     build_and_deploy_job:
       runs-on: ubuntu-latest
       name: Build and Deploy Job
       steps:
         - uses: actions/checkout@v3
         - name: Build And Deploy
           uses: Azure/static-web-apps-deploy@v1
           with:
             azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
             repo_token: ${{ secrets.GITHUB_TOKEN }}
             action: "upload"
             app_location: "/"
             output_location: "dist"
   ```

3. **Environment Variables**
   Add environment variables in Azure Portal:
   - Go to your Static Web App → Configuration
   - Add application settings:
     ```
     VITE_API_BASE_URL=https://your-api-domain.com/
     VITE_AZURE_CLIENT_ID=your-client-id
     VITE_AZURE_AUTHORITY=https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/your-policy
     ```

### Method 2: Azure CLI Deployment

1. **Install Azure CLI**
   ```bash
   # macOS
   brew install azure-cli
   
   # Windows
   winget install Microsoft.AzureCLI
   
   # Linux
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Login to Azure**
   ```bash
   az login
   ```

3. **Build the Application**
   ```bash
   npm run build
   ```

4. **Deploy to Static Web App**
   ```bash
   az staticwebapp deploy \
     --name your-static-web-app-name \
     --resource-group your-resource-group \
     --source-location dist
   ```

### Method 3: VS Code Extension

1. **Install Azure Static Web Apps Extension**
   - Install the "Azure Static Web Apps" extension in VS Code

2. **Deploy from VS Code**
   - Right-click on the `dist` folder
   - Select "Deploy to Static Web App"
   - Choose your Azure subscription and Static Web App

## 🌐 Other Hosting Platforms

### Netlify

1. **Build Configuration**
   Create `netlify.toml` in the root directory:
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

### Vercel

1. **Build Configuration**
   Create `vercel.json` in the root directory:
   ```json
   {
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

2. **Deploy**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the build configuration

### GitHub Pages

1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     },
     "homepage": "https://yourusername.github.io/gainit-frontend-project"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

## 🔧 Build Configuration

### Vite Configuration

The `vite.config.js` file is already configured for production builds:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          auth: ['@azure/msal-browser', '@azure/msal-react']
        }
      }
    }
  }
})
```

### Environment Variables

For production deployment, ensure these environment variables are set:

```bash
# Required
VITE_API_BASE_URL=https://your-production-api.com/

# Optional (if using custom Azure AD B2C)
VITE_AZURE_CLIENT_ID=your-production-client-id
VITE_AZURE_AUTHORITY=https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/your-policy
```

## 🚦 Pre-deployment Checklist

### Code Quality
- [ ] All tests pass (`npm run lint`)
- [ ] Build completes successfully (`npm run build`)
- [ ] No console errors in development
- [ ] All environment variables configured

### Performance
- [ ] Bundle size is optimized
- [ ] Images are compressed
- [ ] Lazy loading implemented where appropriate
- [ ] CDN configured for static assets

### Security
- [ ] No sensitive data in client-side code
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Authentication flow tested

### Functionality
- [ ] All user flows work correctly
- [ ] Authentication works with production Azure AD B2C
- [ ] API integration tested with production backend
- [ ] Error handling works properly

## 🔍 Post-deployment Verification

### Health Checks

1. **Application Loads**
   - Verify the application loads without errors
   - Check browser console for any JavaScript errors

2. **Authentication**
   - Test login/logout functionality
   - Verify role selection works
   - Test profile access for different roles

3. **Core Features**
   - Project search functionality
   - Project creation and management
   - Real-time collaboration features
   - AI insights integration

4. **Performance**
   - Check page load times
   - Verify responsive design on different devices
   - Test with slow network connections

### Monitoring

Set up monitoring for:
- Application performance
- Error rates
- User authentication issues
- API response times

## 🛠️ Troubleshooting Deployment Issues

### Common Issues

1. **Build Failures**
   ```bash
   # Check for TypeScript errors
   npm run build
   
   # Check for linting errors
   npm run lint
   ```

2. **Environment Variables Not Working**
   - Ensure variables start with `VITE_`
   - Check Azure Static Web Apps configuration
   - Verify variable names match exactly

3. **Routing Issues**
   - Ensure `staticwebapp.config.json` is configured correctly
   - Check that all routes redirect to `index.html`

4. **Authentication Issues**
   - Verify Azure AD B2C configuration
   - Check redirect URIs in Azure portal
   - Ensure CORS is configured on backend

### Debug Commands

```bash
# Local build test
npm run build
npm run preview

# Check bundle size
npm run build -- --analyze

# Test with production API
VITE_API_BASE_URL=https://your-api.com npm run dev
```

## 📊 Performance Optimization

### Bundle Optimization

1. **Code Splitting**
   - Implement lazy loading for routes
   - Split vendor libraries into separate chunks

2. **Asset Optimization**
   - Compress images
   - Use WebP format where supported
   - Implement proper caching headers

3. **CDN Configuration**
   - Configure CDN for static assets
   - Enable gzip compression
   - Set appropriate cache headers

### Monitoring Performance

- Use browser DevTools to analyze bundle size
- Monitor Core Web Vitals
- Set up performance monitoring in production

## 🔄 Continuous Deployment

### Branch Strategy

- `main` branch: Production deployments
- `develop` branch: Staging deployments
- Feature branches: Development and testing

### Deployment Pipeline

1. **Development**: Feature branches
2. **Staging**: `develop` branch → Staging environment
3. **Production**: `main` branch → Production environment

### Rollback Strategy

- Keep previous deployments available
- Implement feature flags for gradual rollouts
- Monitor error rates and performance metrics

## 📞 Support

For deployment issues:
- Check Azure Static Web Apps logs
- Review GitHub Actions workflow logs
- Consult Azure documentation
- Create an issue in the repository

## 🔗 Useful Links

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Vite Build Configuration](https://vitejs.dev/config/build-options.html)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)
