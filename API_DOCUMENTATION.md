# API Documentation

This document provides comprehensive documentation for the Gainit frontend API integration, including endpoints, authentication, error handling, and service layer implementation.

## 🌐 API Overview

The Gainit frontend integrates with a RESTful backend API that provides user management, project collaboration, and real-time communication features.

### Base Configuration

```javascript
// API Base URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  'https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/';

// API Service Configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

## 🔐 Authentication

### Authentication Flow

The application uses Azure AD B2C for authentication with JWT tokens:

```typescript
// Authentication Headers
const authHeaders = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
};
```

### Token Management

```javascript
// Automatic token injection via interceptors
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

## 👤 User Management API

### User Information

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "gainer",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Ensure User Exists
```http
POST /api/users/me/ensure
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

#### Update User Role
```http
PATCH /api/users/{userId}/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "gainer" | "mentor" | "nonprofit"
}
```

### User Profiles

#### Get Gainer Profile
```http
GET /api/users/gainer/{userId}/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "user-uuid",
  "role": "gainer",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York, NY"
  },
  "professionalInfo": {
    "title": "Junior Developer",
    "company": "Tech Corp",
    "experience": "1-2 years",
    "skills": ["JavaScript", "React", "Node.js"],
    "bio": "Passionate developer looking to grow..."
  },
  "preferences": {
    "projectTypes": ["web-development", "mobile-apps"],
    "timeCommitment": "10-20 hours/week",
    "availability": "evenings-weekends"
  }
}
```

#### Get Mentor Profile
```http
GET /api/users/mentor/{userId}/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "user-uuid",
  "role": "mentor",
  "personalInfo": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "location": "San Francisco, CA"
  },
  "professionalInfo": {
    "title": "Senior Software Engineer",
    "company": "Tech Giant",
    "experience": "10+ years",
    "expertise": ["Full-stack Development", "Architecture", "Team Leadership"],
    "bio": "Experienced engineer passionate about mentoring..."
  },
  "mentoringInfo": {
    "specialties": ["React", "Node.js", "System Design"],
    "maxMentees": 5,
    "availability": "weekday-evenings",
    "preferredCommunication": ["slack", "video-calls"]
  }
}
```

#### Get Nonprofit Profile
```http
GET /api/users/nonprofit/{userId}/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "user-uuid",
  "role": "nonprofit",
  "organizationInfo": {
    "name": "Tech for Good",
    "website": "https://techforgood.org",
    "email": "contact@techforgood.org",
    "phone": "+1234567890",
    "address": "123 Main St, City, State 12345"
  },
  "missionInfo": {
    "mission": "Using technology to solve social problems",
    "description": "We connect nonprofits with tech volunteers...",
    "focusAreas": ["education", "healthcare", "environment"],
    "targetAudience": "Underserved communities"
  },
  "projectInfo": {
    "projectTypes": ["web-applications", "mobile-apps", "data-analysis"],
    "budget": "volunteer-based",
    "timeline": "3-6 months",
    "requirements": "Responsive design, accessibility compliance"
  }
}
```

## 🚀 Project Management API

### Projects

#### Get All Projects
```http
GET /api/projects
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `category` (optional): Filter by category
- `status` (optional): Filter by status
- `search` (optional): Search term

**Response:**
```json
{
  "projects": [
    {
      "id": "project-uuid",
      "title": "Community Food Bank App",
      "description": "Mobile app to help food banks manage inventory",
      "category": "mobile-apps",
      "status": "active",
      "createdBy": "nonprofit-uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "tags": ["react-native", "inventory-management"],
      "requirements": {
        "skills": ["React Native", "Firebase"],
        "timeCommitment": "10-15 hours/week",
        "duration": "3 months"
      },
      "team": {
        "maxMembers": 5,
        "currentMembers": 2,
        "roles": ["frontend-developer", "backend-developer"]
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

#### Get Project by ID
```http
GET /api/projects/{projectId}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "project-uuid",
  "title": "Community Food Bank App",
  "description": "Detailed project description...",
  "category": "mobile-apps",
  "status": "active",
  "createdBy": {
    "id": "nonprofit-uuid",
    "name": "Tech for Good",
    "role": "nonprofit"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "tags": ["react-native", "inventory-management"],
  "requirements": {
    "skills": ["React Native", "Firebase"],
    "timeCommitment": "10-15 hours/week",
    "duration": "3 months",
    "description": "Detailed requirements..."
  },
  "team": {
    "maxMembers": 5,
    "currentMembers": 2,
    "members": [
      {
        "id": "user-uuid",
        "name": "John Doe",
        "role": "frontend-developer",
        "joinedAt": "2024-01-15T00:00:00Z"
      }
    ],
    "availableRoles": ["backend-developer", "ui-designer"]
  },
  "milestones": [
    {
      "id": "milestone-uuid",
      "title": "Project Setup",
      "description": "Set up development environment",
      "status": "completed",
      "dueDate": "2024-01-31T00:00:00Z",
      "completedAt": "2024-01-25T00:00:00Z"
    }
  ]
}
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Project",
  "description": "Project description",
  "category": "web-development",
  "requirements": {
    "skills": ["React", "Node.js"],
    "timeCommitment": "10-15 hours/week",
    "duration": "2 months"
  },
  "team": {
    "maxMembers": 4,
    "roles": ["frontend-developer", "backend-developer"]
  }
}
```

#### Update Project
```http
PATCH /api/projects/{projectId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Project Title",
  "description": "Updated description",
  "status": "active"
}
```

#### Join Project
```http
POST /api/projects/{projectId}/join
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "frontend-developer",
  "message": "I'm interested in contributing to this project"
}
```

## 📋 Task Management API

### Tasks

#### Get Project Tasks
```http
GET /api/projects/{projectId}/tasks
Authorization: Bearer {token}
```

**Response:**
```json
{
  "tasks": [
    {
      "id": "task-uuid",
      "title": "Set up React Native project",
      "description": "Initialize React Native project with necessary dependencies",
      "status": "in-progress",
      "priority": "high",
      "assignedTo": "user-uuid",
      "createdBy": "user-uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "dueDate": "2024-01-15T00:00:00Z",
      "tags": ["setup", "react-native"],
      "comments": [
        {
          "id": "comment-uuid",
          "content": "Project initialized successfully",
          "author": "user-uuid",
          "createdAt": "2024-01-02T00:00:00Z"
        }
      ]
    }
  ]
}
```

#### Create Task
```http
POST /api/projects/{projectId}/tasks
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "priority": "medium",
  "assignedTo": "user-uuid",
  "dueDate": "2024-01-31T00:00:00Z",
  "tags": ["frontend", "ui"]
}
```

#### Update Task
```http
PATCH /api/projects/{projectId}/tasks/{taskId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "completed",
  "title": "Updated Task Title"
}
```

## 🎯 Milestone Management API

### Milestones

#### Get Project Milestones
```http
GET /api/projects/{projectId}/milestones
Authorization: Bearer {token}
```

**Response:**
```json
{
  "milestones": [
    {
      "id": "milestone-uuid",
      "title": "MVP Release",
      "description": "Minimum viable product with core features",
      "status": "pending",
      "dueDate": "2024-02-15T00:00:00Z",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "tasks": [
        {
          "id": "task-uuid",
          "title": "User authentication",
          "status": "completed"
        }
      ],
      "progress": 75
    }
  ]
}
```

#### Create Milestone
```http
POST /api/projects/{projectId}/milestones
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Milestone",
  "description": "Milestone description",
  "dueDate": "2024-03-01T00:00:00Z"
}
```

## 🔗 GitHub Integration API

### Repository Management

#### Link Repository
```http
POST /api/projects/{projectId}/repository
Authorization: Bearer {token}
Content-Type: application/json

{
  "repositoryUrl": "https://github.com/username/repository",
  "branch": "main"
}
```

#### Get Repository Stats
```http
GET /api/projects/{projectId}/repository/stats
Authorization: Bearer {token}
```

**Response:**
```json
{
  "repository": {
    "url": "https://github.com/username/repository",
    "name": "repository-name",
    "description": "Repository description",
    "language": "JavaScript",
    "stars": 15,
    "forks": 3,
    "lastUpdated": "2024-01-01T00:00:00Z"
  },
  "contributors": [
    {
      "username": "developer1",
      "commits": 25,
      "additions": 1200,
      "deletions": 300
    }
  ],
  "recentActivity": [
    {
      "type": "commit",
      "message": "Add user authentication",
      "author": "developer1",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## 🤖 AI Insights API

### Project Recommendations

#### Get AI Insights
```http
GET /api/ai/insights
Authorization: Bearer {token}
```

**Query Parameters:**
- `userId` (optional): User ID for personalized insights
- `type` (optional): Insight type (recommendations, trends, analysis)

**Response:**
```json
{
  "insights": [
    {
      "id": "insight-uuid",
      "type": "project-recommendation",
      "title": "Recommended Projects",
      "description": "Based on your skills and interests",
      "data": [
        {
          "projectId": "project-uuid",
          "title": "E-commerce Platform",
          "matchScore": 0.85,
          "reason": "Matches your React and Node.js skills"
        }
      ],
      "generatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## 🔄 Real-time Communication

### SignalR Hub

The application uses SignalR for real-time communication:

```javascript
// SignalR Connection
const connection = new signalR.HubConnectionBuilder()
  .withUrl("/collaborationHub")
  .build();

// Event Handlers
connection.on("TaskUpdated", (task) => {
  // Handle task updates
});

connection.on("UserJoined", (user) => {
  // Handle user joining project
});

connection.on("MessageReceived", (message) => {
  // Handle chat messages
});
```

### Real-time Events

#### Task Updates
```javascript
// Server sends task updates
{
  "event": "TaskUpdated",
  "data": {
    "taskId": "task-uuid",
    "projectId": "project-uuid",
    "changes": {
      "status": "completed",
      "updatedBy": "user-uuid"
    }
  }
}
```

#### User Activity
```javascript
// Server sends user activity
{
  "event": "UserActivity",
  "data": {
    "userId": "user-uuid",
    "projectId": "project-uuid",
    "activity": "viewed_task",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## 🚨 Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ],
    "timestamp": "2024-01-01T00:00:00Z",
    "requestId": "req-uuid"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

### Error Handling in Frontend

```javascript
// Service layer error handling
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Redirect to login
        redirectToLogin();
        break;
      case 403:
        // Show access denied message
        showError('Access denied');
        break;
      case 422:
        // Show validation errors
        showValidationErrors(data.error.details);
        break;
      default:
        showError(data.error.message || 'An error occurred');
    }
  } else if (error.request) {
    // Network error
    showError('Network error. Please check your connection.');
  } else {
    // Other error
    showError('An unexpected error occurred');
  }
};
```

## 📊 Service Layer Implementation

### Base API Service

```javascript
// src/services/api.js
import axios from 'axios';

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL;
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    axios.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  getAuthToken() {
    // Get token from MSAL or localStorage
    return localStorage.getItem('accessToken');
  }

  handleError(error) {
    if (error.response?.status === 401) {
      // Handle authentication error
      this.handleAuthError();
    }
    return Promise.reject(error);
  }

  handleAuthError() {
    // Redirect to login or refresh token
    window.location.href = '/login';
  }
}

export default new ApiService();
```

### Specific Service Examples

```javascript
// src/services/projectsService.js
import api from './api';

export const projectsService = {
  async getAll(params = {}) {
    const response = await api.get('/api/projects', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/api/projects/${id}`);
    return response.data;
  },

  async create(projectData) {
    const response = await api.post('/api/projects', projectData);
    return response.data;
  },

  async update(id, updates) {
    const response = await api.patch(`/api/projects/${id}`, updates);
    return response.data;
  },

  async join(id, joinData) {
    const response = await api.post(`/api/projects/${id}/join`, joinData);
    return response.data;
  }
};
```

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com/

# Azure AD B2C Configuration
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_AUTHORITY=https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/your-policy

# SignalR Configuration
VITE_SIGNALR_HUB_URL=https://your-api-domain.com/collaborationHub
```

### API Configuration File

```javascript
// src/config/api.js
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
};

export const ENDPOINTS = {
  USERS: {
    ME: '/api/users/me',
    ENSURE: '/api/users/me/ensure',
    PROFILE: (role, userId) => `/api/users/${role}/${userId}/profile`,
    UPDATE_ROLE: (userId) => `/api/users/${userId}/role`
  },
  PROJECTS: {
    LIST: '/api/projects',
    DETAIL: (id) => `/api/projects/${id}`,
    CREATE: '/api/projects',
    UPDATE: (id) => `/api/projects/${id}`,
    JOIN: (id) => `/api/projects/${id}/join`
  },
  TASKS: {
    LIST: (projectId) => `/api/projects/${projectId}/tasks`,
    CREATE: (projectId) => `/api/projects/${projectId}/tasks`,
    UPDATE: (projectId, taskId) => `/api/projects/${projectId}/tasks/${taskId}`
  }
};
```

This API documentation provides a comprehensive guide for integrating with the Gainit backend services. For additional support or questions, please refer to the troubleshooting guide or create an issue in the repository.
