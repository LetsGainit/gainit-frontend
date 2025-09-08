import React, { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle, Users } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getUserProjects, startProject, updateProjectRepository } from "../../services/projectsService";
import ProjectCardWork from "../../components/project/ProjectCardWork";
import JoinRequestsModal from "../../components/JoinRequestsModal";
import Toast from "../../components/Toast";
import "./MyProjects.css";

const MyProjects = () => {
  const [activeTab, setActiveTab] = useState("Active");
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startingId, setStartingId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("info");
  const [showRepoModalFor, setShowRepoModalFor] = useState(null);
  const [repoUrl, setRepoUrl] = useState("");
  const [savingRepo, setSavingRepo] = useState(false);
  const [showJoinRequestsModal, setShowJoinRequestsModal] = useState(false);
  const [selectedProjectForRequests, setSelectedProjectForRequests] = useState(null);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);
  
  const { userInfo } = useAuth();

  // Status mapping between UI tabs and backend statuses
  const statusMapping = {
    "Active": "InProgress",
    "Complited": "Completed", 
    "Requested": "Pending"
  };

  // Generate correlation ID
  const generateCorrelationId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Helper function to calculate days left
  const calculateDaysLeft = (createdAtUtc, duration) => {
    if (!createdAtUtc || !duration) return null;
    
    try {
      const startDate = new Date(createdAtUtc);
      const durationInDays = typeof duration === 'string' ? parseInt(duration.split('.')[0]) || 0 : 0;
      const endDate = new Date(startDate.getTime() + (durationInDays * 24 * 60 * 60 * 1000));
      const today = new Date();
      const daysLeft = Math.ceil((endDate - today) / (24 * 60 * 60 * 1000));
      
      return Math.max(0, daysLeft);
    } catch (error) {
      console.error('Error calculating days left:', error);
      return null;
    }
  };

  // Fetch user projects
  const fetchUserProjects = useCallback(async () => {
    const correlationId = generateCorrelationId();
    console.log(`[MY-PROJECTS] Fetching projects for current user via /projects/user/me with correlation ID: ${correlationId}`);

    try {
      setLoading(true);
      setError(null);

      // Real API call using /projects/user/me (no userId required)
      const projects = await getUserProjects(correlationId);

      const safeProjects = Array.isArray(projects) ? projects : [];
      console.log(`[MY-PROJECTS] Successfully fetched ${safeProjects.length} projects`);
      setAllProjects(safeProjects);
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
  }, [userInfo?.userId]);

  // Filter projects based on active tab
  const visibleProjects = allProjects.filter(project => {
    const backendStatus = statusMapping[activeTab];
    return project.projectStatus === backendStatus;
  });

  // Load projects on mount
  useEffect(() => {
    fetchUserProjects();
  }, [fetchUserProjects]);

  const handleStartProject = async (projectId) => {
    if (!projectId) return;
    const correlationId = generateCorrelationId();
    try {
      setStartingId(projectId);
      await startProject(projectId, correlationId);
      setToastMessage("Project started. Status changed to Active.");
      setToastType("success");
      setShowToast(true);
      await fetchUserProjects();
      setActiveTab("Active");
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to start project.";
      setToastMessage(message);
      setToastType("error");
      setShowToast(true);
    } finally {
      setStartingId(null);
    }
  };

  const handleConnectRepository = async (projectId) => {
    const isValidRepoUrl = /^https?:\/\/(www\.)?github\.com\/[^\/\s]+\/[^\/\s#]+\/?$/.test(repoUrl);
    if (!isValidRepoUrl) return;
    const correlationId = generateCorrelationId();
    try {
      setSavingRepo(true);
      await updateProjectRepository(projectId, repoUrl, correlationId);
      setToastMessage("Repository connected.");
      setToastType("success");
      setShowToast(true);
      setShowRepoModalFor(null);
      setRepoUrl("");
      await fetchUserProjects();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to connect repository.";
      setToastMessage(message);
      setToastType("error");
      setShowToast(true);
    } finally {
      setSavingRepo(false);
    }
  };

  const handleViewJoinRequests = (projectId) => {
    const project = allProjects.find(p => p.projectId === projectId);
    if (project) {
      setJoinRequestsLoading(true);
      setSelectedProjectForRequests({
        id: projectId,
        name: project.projectName || 'Unknown Project'
      });
      setShowJoinRequestsModal(true);
    }
  };

  const handleCloseJoinRequestsModal = () => {
    setShowJoinRequestsModal(false);
    setSelectedProjectForRequests(null);
    setJoinRequestsLoading(false);
  };

  const handleJoinRequestDecision = (projectId, joinRequestId, isApproved) => {
    // Refresh projects after decision to update any status changes
    fetchUserProjects();
    
    // Show success message
    setToastMessage(isApproved ? 'Join request approved!' : 'Join request rejected!');
    setToastType('success');
    setShowToast(true);
  };

  const handleJoinRequestError = (error) => {
    let message = 'Failed to process join request';
    
    // Handle specific error cases
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      message = 'You do not have permission to view join requests. Only project administrators can access this feature.';
    } else if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }
    
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
  };

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
    // Calculate days left from createdAtUtc + duration
    const daysLeft = calculateDaysLeft(project.createdAtUtc, project.duration);
    let durationText = "3 Months"; // Default fallback
    
    if (daysLeft !== null) {
      durationText = `${daysLeft} days left`;
    } else if (project.duration && typeof project.duration === 'string' && project.duration.includes(":")) {
      const days = project.duration.split(".")[0];
      durationText = `${days} days`;
    } else if (project.duration && typeof project.duration === 'string' && project.duration.includes(".")) {
      const days = project.duration.split(".")[0];
      durationText = `${days} days`;
    }

    // Combine programming languages and technologies
    const allTechnologies = [
      ...(project.programmingLanguages || []),
      ...(project.technologies || [])
    ];

    return {
      id: project.projectId,
      title: project.projectName || "Untitled Project",
      description: project.projectDescription || "No description available",
      image: project.projectPictureUrl || "/default-featured-image.png",
      duration: durationText,
      openPositions: Array.isArray(project.openRoles) ? project.openRoles.length : 0,
      technologies: allTechnologies,
      status: activeTab,
      projectStatus: project.projectStatus
    };
  };

  // Get empty state message
  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "Active":
        return "No active projects yet.";
      case "Complited":
        return "No completed projects yet.";
      case "Requested":
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
              <button 
                className="retry-button"
                onClick={fetchUserProjects}
                disabled={loading}
              >
                {loading ? "Retrying..." : "Try Again"}
              </button>
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
              <ProjectCardWork 
                key={project.projectId} 
                project={mapProjectToCard(project)} 
                startingId={startingId}
                onStartProject={handleStartProject}
                onConnectRepo={(pid) => setShowRepoModalFor(pid)}
                onViewJoinRequests={handleViewJoinRequests}
                hasRepository={Boolean(project.repositoryUrl || project.repositoryLink || project.RepositoryLink)}
                loadingJoinRequests={joinRequestsLoading && selectedProjectForRequests?.id === project.projectId}
                isProjectAdmin={project.isAdmin}
              />
            ))}
          </div>
        )}
      </div>
      {showRepoModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2">Connect GitHub Repository</h3>
            <p className="text-sm mb-3">Create a repository on GitHub and paste the URL here.</p>
            <label className="block text-sm font-medium mb-1">Repository URL (required)</label>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value.trim())}
              placeholder="https://github.com/owner/repo"
              className="w-full rounded-lg border px-3 py-2"
              required
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => { setShowRepoModalFor(null); setRepoUrl(""); }}>
                Cancel
              </button>
              <button
                className="btn-primary px-4 py-2 rounded-xl font-medium"
                disabled={!/^https?:\/\/(www\.)?github\.com\/[^\/\s]+\/[^\/\s#]+\/?$/.test(repoUrl) || savingRepo}
                onClick={() => handleConnectRepository(showRepoModalFor)}
              >
                {savingRepo ? 'Connecting…' : 'Create repository connection'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}

      {/* Join Requests Modal */}
      {showJoinRequestsModal && selectedProjectForRequests && (
        <JoinRequestsModal
          isOpen={showJoinRequestsModal}
          onClose={handleCloseJoinRequestsModal}
          projectId={selectedProjectForRequests.id}
          projectName={selectedProjectForRequests.name}
          onDecision={handleJoinRequestDecision}
          onError={handleJoinRequestError}
          loading={joinRequestsLoading}
        />
      )}
    </div>
  );
};

export default MyProjects;
