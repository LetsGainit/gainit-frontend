import React, { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle, Users } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getUserProjects } from "../../services/projectsService";
import ProjectCard from "../../components/ProjectCard";
import "./MyProjects.css";

const MyProjects = () => {
  const [activeTab, setActiveTab] = useState("Active");
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { userInfo } = useAuth();

  // Status mapping between UI tabs and backend statuses
  const statusMapping = {
    "Active": "InProgress",
    "Complited": "Completed", 
    "Pending": "Pending"
  };

  // Generate correlation ID
  const generateCorrelationId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Temporary mock data for testing the flow
  const tempMockProjects = [
    {
      projectId: "temp-1",
      projectName: "Eco-Friendly Mobile App",
      projectDescription: "A mobile application that helps users track their carbon footprint and provides eco-friendly lifestyle recommendations. Features include daily activity tracking, carbon offset calculations, and community challenges.",
      projectPictureUrl: "/default-featured-image.png",
      duration: "90.00:00:00",
      status: "InProgress",
      technologies: ["React Native", "Node.js", "MongoDB", "AWS", "Firebase"],
      projectTeamMembers: [
        { userId: "1", fullName: "John Doe", roleInProject: "Frontend Developer" },
        { userId: "2", fullName: "Jane Smith", roleInProject: "Backend Developer" },
        { userId: "3", fullName: "Mike Johnson", roleInProject: "UI/UX Designer" }
      ],
      repositoryLink: "https://github.com/example/eco-app"
    }
  ];

  // Fetch user projects
  const fetchUserProjects = useCallback(async () => {
    const correlationId = generateCorrelationId();
    console.log(`[MY-PROJECTS] Fetching projects with correlation ID: ${correlationId}`);

    try {
      setLoading(true);
      setError(null);

      // TEMPORARY: Use mock data for testing the flow
      // TODO: Remove this and uncomment the real API call below
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      const projects = tempMockProjects;
      
      // Real API call (commented out for testing)
      // const projects = await getUserProjects(userInfo.userId, correlationId);

      console.log(`[MY-PROJECTS] Successfully fetched ${projects.length} projects`);
      setAllProjects(projects || []);
    } catch (err) {
      console.error("[MY-PROJECTS] Failed to fetch projects:", err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Authentication failed. Please sign in again.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError("Failed to load projects. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter projects based on active tab
  const visibleProjects = allProjects.filter(project => {
    const backendStatus = statusMapping[activeTab];
    return project.status === backendStatus;
  });

  // Load projects on mount
  useEffect(() => {
    fetchUserProjects();
  }, [fetchUserProjects]);

  const tabs = [
    {
      id: "Active",
      label: "Active",
      icon: Clock,
    },
    {
      id: "Complited",
      label: "Complited",
      icon: CheckCircle,
    },
    {
      id: "Requested",
      label: "Pending",
      icon: Users,
    },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleKeyDown = (event, tabId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveTab(tabId);
    }
  };

  // Map project data to ProjectCard format
  const mapProjectToCard = (project) => {
    // Handle duration format (convert "120.00:00:00" to "120 days" or similar)
    let duration = project.duration || "3 Months";
    if (duration && duration.includes(":")) {
      const days = duration.split(".")[0];
      duration = `${days} days`;
    }

    return {
      id: project.projectId,
      title: project.projectName || "Untitled Project",
      description: project.projectDescription || "No description available",
      image: project.projectPictureUrl || project.projectImage || "/default-featured-image.png",
      duration: duration,
      openPositions: project.projectTeamMembers?.length || 0,
      technologies: project.technologies || [],
      repositoryLink: project.repositoryLink,
      status: activeTab
    };
  };

  // Get empty state message
  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "Active":
        return "No active projects yet.";
      case "Complited":
        return "No completed projects yet.";
      case "Pending":
        return "No pending projects yet.";
      default:
        return "No projects found.";
    }
  };

  return (
    <div className="my-projects-page">
      {/* Page Header */}
      <div className="my-projects-header">
        <h1 className="page-title">My Projects</h1>
        <p className="page-subtitle">
          Manage your active projects and track your contributions
        </p>
      </div>

      {/* Tabs Row */}
      <div className="tabs-container">
        <div
          className="tabs-row"
          role="tablist"
          aria-label="Project categories"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                className={`tab-button ${isActive ? "active" : ""}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id)}
                tabIndex={isActive ? 0 : -1}
              >
                <Icon size={16} className="tab-icon" />
                <span className="tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Region */}
      <div className="content-region">

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="skeleton-cards">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-meta"></div>
                    <div className="skeleton-title"></div>
                    <div className="skeleton-description"></div>
                    <div className="skeleton-tech"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <div className="error-content">
              <h3>Unable to load projects</h3>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && visibleProjects.length === 0 && (
          <div className="empty-state">
            <div className="empty-content">
              <h3>{getEmptyStateMessage()}</h3>
              <p>Projects will appear here once you join or create them.</p>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && !error && visibleProjects.length > 0 && (
          <div className="projects-grid">
            {visibleProjects.map((project) => (
              <ProjectCard 
                key={project.projectId} 
                project={mapProjectToCard(project)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProjects;
