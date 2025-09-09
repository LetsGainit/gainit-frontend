# Contributing to Gainit

Thank you for your interest in contributing to Gainit! This guide will help you get started with contributing to our project collaboration platform.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Git
- Azure AD B2C tenant access (for authentication testing)
- Backend API access

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/gainit-frontend-project.git
   cd gainit-frontend-project
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```bash
   VITE_API_BASE_URL=https://your-api-domain.com/
   VITE_AZURE_CLIENT_ID=your-client-id
   VITE_AZURE_AUTHORITY=https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/your-policy
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style

- **ESLint**: We use ESLint for code quality. Run `npm run lint` to check your code
- **Formatting**: Use consistent indentation (2 spaces)
- **Naming Conventions**:
  - Components: PascalCase (e.g., `UserProfile.jsx`)
  - Files: PascalCase for components, camelCase for utilities
  - Variables: camelCase
  - Constants: UPPER_SNAKE_CASE

### Component Structure

```jsx
// Component imports
import React from 'react';
import { useState, useEffect } from 'react';

// External library imports
import axios from 'axios';

// Internal imports
import { useAuth } from '../hooks/useAuth';
import './ComponentName.css';

// Component definition
const ComponentName = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState(null);
  const { user } = useAuth();

  // Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // Event handlers
  const handleEvent = () => {
    // Handler logic
  };

  // Render
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

### File Organization

- **Components**: Place in appropriate subdirectories under `src/components/`
- **Pages**: Place in `src/pages/` with their own subdirectories
- **Services**: Place in `src/services/` for API calls and business logic
- **Hooks**: Place in `src/hooks/` for custom React hooks
- **Utils**: Place in `src/utils/` for utility functions
- **Styles**: Place CSS files alongside their components

### API Integration

- Use the centralized API configuration in `src/config/api.js`
- Create service functions in `src/services/` for API calls
- Handle errors gracefully with user-friendly messages
- Use proper loading states for async operations

```javascript
// Example service function
export const fetchUserProfile = async (userId) => {
  try {
    const response = await api.get(`/api/users/${userId}/profile`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear Description**: What happened vs. what you expected
2. **Steps to Reproduce**: Detailed steps to recreate the issue
3. **Environment**: Browser, OS, Node.js version
4. **Screenshots**: If applicable
5. **Console Logs**: Any error messages or console output

### Bug Report Template

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Node.js Version: [e.g., 18.17.0]

## Additional Context
Any other context about the problem
```

## ✨ Feature Requests

When requesting features:

1. **Clear Use Case**: Explain why this feature would be valuable
2. **User Story**: Describe how users would interact with the feature
3. **Acceptance Criteria**: Define what "done" looks like
4. **Mockups/Wireframes**: Visual representations if applicable

### Feature Request Template

```markdown
## Feature Description
Brief description of the feature

## User Story
As a [user type], I want [functionality] so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Additional Context
Any additional context, mockups, or examples
```

## 🔄 Pull Request Process

### Before Submitting

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/your-bug-fix
   ```

2. **Make Changes**
   - Write clean, readable code
   - Add comments for complex logic
   - Update documentation if needed
   - Add tests if applicable

3. **Test Your Changes**
   ```bash
   npm run lint
   npm run build
   npm run preview
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add user profile editing functionality"
   ```

### Commit Message Format

Use conventional commit format:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] I have tested these changes locally
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing unit tests pass locally

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

## 🧪 Testing

### Manual Testing

- Test all user flows related to your changes
- Test on different browsers and devices
- Test with different user roles (Gainer, Mentor, Nonprofit)
- Test error scenarios and edge cases

### Automated Testing

While we don't have comprehensive test coverage yet, consider adding tests for:

- Critical business logic
- API integration functions
- Complex utility functions
- Component behavior

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document component props and their types
- Explain business logic and algorithms
- Update README files when adding new features

### User Documentation

- Update user guides for new features
- Add screenshots for UI changes
- Document new API endpoints or configuration options

## 🏗️ Architecture Guidelines

### Component Design

- Keep components small and focused
- Use composition over inheritance
- Follow the single responsibility principle
- Make components reusable when possible

### State Management

- Use React hooks for local state
- Lift state up when multiple components need it
- Consider context for global state
- Avoid prop drilling

### Performance

- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Lazy load components when appropriate
- Optimize images and assets

## 🔒 Security

- Never commit sensitive information (API keys, tokens)
- Validate user input
- Use proper authentication checks
- Follow OWASP guidelines for web security

## 🎨 UI/UX Guidelines

### Design System

- Follow existing design patterns
- Use consistent spacing and typography
- Maintain accessibility standards
- Ensure responsive design

### Accessibility

- Use semantic HTML elements
- Provide alt text for images
- Ensure keyboard navigation works
- Maintain proper color contrast

## 📞 Getting Help

- **Documentation**: Check existing docs first
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for help during the review process

## 🏆 Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to Gainit! Your efforts help make the platform better for everyone.
