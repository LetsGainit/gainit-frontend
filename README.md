# Gainit – Project Collaboration Platform

Gainit is a comprehensive platform that connects junior developers, students, mentors, and nonprofit organizations to collaborate on real-world projects. This frontend application is built with React + Vite and provides an intuitive interface for project discovery, collaboration, and skill development.

## 🚀 Features

### Core Functionality
- **Project Discovery**: Search and browse available projects across different categories
- **Role-Based Access**: Support for Gainers (students/junior developers), Mentors, and Nonprofit organizations
- **Authentication**: Secure Azure AD B2C integration for user management
- **Profile Management**: Role-specific profile pages with customizable information
- **Project Collaboration**: Real-time project work areas with task management
- **AI Insights**: AI-powered project recommendations and insights
- **Learning Resources**: Educational content and skill development materials

### User Experience
- **Responsive Design**: Mobile-first approach with seamless cross-device experience
- **Intuitive Navigation**: Clean, modern UI with role-based navigation
- **Error Handling**: Comprehensive error boundaries and user feedback systems

## 🛠️ Tech Stack

- **Frontend Framework**: React 19.0.0
- **Build Tool**: Vite 6.2.0
- **Routing**: React Router DOM 7.5.3
- **Authentication**: Azure MSAL (Microsoft Authentication Library)
- **HTTP Client**: Axios 1.10.0
- **Real-time Communication**: Microsoft SignalR 9.0.6
- **Icons**: Lucide React & React Icons
- **Styling**: CSS3 with modern features
- **Deployment**: Azure Static Web Apps

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Azure AD B2C tenant (for authentication)
- Backend API access

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gainit-frontend-project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# API Configuration
VITE_API_BASE_URL=https://your-api-domain.com/

# Azure AD B2C Configuration (if needed)
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_AUTHORITY=https://your-tenant.b2clogin.com/your-tenant.onmicrosoft.com/your-policy
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
src/
├── auth/                 # Authentication configuration and components
├── components/           # Reusable UI components
│   ├── code/            # Code-related components
│   ├── common/          # Shared components
│   ├── layout/          # Layout components
│   ├── milestones/      # Milestone management components
│   └── project/         # Project-specific components
├── config/              # Configuration files
├── css/                 # Global styles and component styles
├── hooks/               # Custom React hooks
├── pages/               # Page components
│   ├── About/           # About page
│   ├── ChooseRole/      # Role selection page
│   ├── HomePage/        # Landing page
│   ├── ProfilePage/     # User profile pages
│   ├── ProjectPage/     # Project detail pages
│   ├── SearchProjects/  # Project search functionality
│   └── WorkArea/        # Project collaboration area
├── services/            # API service layers
└── utils/               # Utility functions
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🔐 Authentication Flow

1. **User Registration/Login**: Azure AD B2C handles authentication
2. **Role Selection**: New users choose their role (Gainer, Mentor, Nonprofit)
3. **Profile Setup**: Role-specific profile configuration
4. **Platform Access**: Full access to platform features based on role

## 🌐 API Integration

The application integrates with a RESTful backend API. Key endpoints include:

- User management and profiles
- Project CRUD operations
- Task and milestone management
- Real-time collaboration features
- AI-powered insights

See [API_CONFIGURATION.md](./API_CONFIGURATION.md) for detailed API documentation.

## 🚀 Deployment

This application is configured for deployment on Azure Static Web Apps. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📚 Documentation

- [API Configuration](./API_CONFIGURATION.md) - API setup and configuration
- [Role Selection](./README_ROLE_SELECTION.md) - Role selection feature documentation
- [Navbar Updates](./README_NAVBAR_UPDATE.md) - Navigation and profile features
- [Architecture Guide](./ARCHITECTURE.md) - Application architecture overview
- [User Guide](./USER_GUIDE.md) - End-user documentation
- [Contributing Guide](./CONTRIBUTING.md) - Development and contribution guidelines
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on how to get started.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review existing documentation
- Create an issue in the repository

## 🔄 Version History

See [CHANGELOG.md](./CHANGELOG.md) for a detailed history of changes and updates.
