import { Clock, Globe, GitBranch, User, Users, Mail, ArrowLeft, ExternalLink, Github, Gauge } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import RequestToJoinModal from "../../components/RequestToJoinModal";
import CreateProjectModal from "../../components/CreateProjectModal";
import Toast from "../../components/Toast";
import "../../css/ProjectPage.css";

function ProjectPage() {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const { userInfo } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectSource, setProjectSource] = useState(null); // 'Active' or 'Template'
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [joinRequestPending, setJoinRequestPending] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      setError(null);
      try {
        // First, try to determine project status by checking if it's an active or template project
        let projectData;
        
        // Try active endpoint first
        try {
          const activeRes = await axios.get(
            `https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/api/projects/${projectId}`
          );
          projectData = activeRes.data;
          setProjectSource('Active');
        } catch (activeErr) {
          // If active fails, try template endpoint
          try {
            const templateRes = await axios.get(
              `https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/api/projects/template/${projectId}`
            );
            projectData = templateRes.data;
            setProjectSource('Template');
          } catch (templateErr) {
            // If both fail, use default endpoint (treat as Active)
            const defaultRes = await axios.get(
              `https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/api/projects/${projectId}`
            );
            projectData = defaultRes.data;
            setProjectSource('Active');
          }
        }
        
        setProject(projectData);
      } catch (err) {
        setError(err.message || "Failed to load project.");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [projectId]);

  const handleRequestToJoin = () => {
    setIsRequestModalOpen(true);
  };

  const handleJoinRequestSubmit = async (data) => {
    try {
      await api.post(`/projects/${projectId}/createrequest`, {
        requestedRole: data.requestedRole,
        message: data.message
      });
      
      setJoinRequestPending(true);
      setIsRequestModalOpen(false);
      setToast({
        message: "Join request sent successfully!",
        type: "success"
      });
    } catch (error) {
      console.error('Failed to send join request:', error);
      setToast({
        message: error.response?.data?.message || "Failed to send join request. Please try again.",
        type: "error"
      });
    }
  };

  const handleCreateProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateProjectSubmit = async () => {
    try {
      const response = await api.get('/projects/start-from-template', {
        params: {
          templateId: projectId,
          userId: userInfo?.userId || "",
        }
      });
      
      setIsCreateModalOpen(false);
      setToast({
        message: "Project created successfully.",
        type: "success"
      });
      
      // Navigate to the new project page
      const newProjectId = response.data?.newProjectId || response.data?.projectId || response.data?.id;
      if (newProjectId) {
        navigate(`/project/${newProjectId}`);
      } else {
        // Fallback: navigate to projects list if no ID returned
        navigate('/search-projects');
      }
    } catch (error) {
      console.error('Failed to create project from template:', error);
      setToast({
        message: "Couldn't create the project. Please try again.",
        type: "error"
      });
    }
  };

  const handleToastClose = () => {
    setToast(null);
  };

  if (loading) {
    return (
      <div className="project-page" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ fontSize: 24 }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-page" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f' }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  // Fallbacks and field mapping
  const title = project.projectName || "Untitled Project";
  const description = project.projectDescription || "No description available.";
  // Duration: convert "120.00:00:00" to "120 days" or use durationText
  let duration = project.durationText || project.duration || "";
  
  // Ensure duration is a string before calling string methods
  if (duration && typeof duration === "string" && duration.includes(":")) {
    const days = duration.split(".")[0];
    duration = `${days} days`;
  } else if (typeof duration === "number") {
    // If duration is a number, convert to a readable format
    duration = `${duration} days`;
  }
  const difficulty = project.difficultyLevel || "Unknown";
  const image = project.projectPictureUrl || "/default-featured-image.png";
  const repositoryLink = project.repositoryLink;
  const goals = project.goals || [];
  const openRoles = project.requiredRoles || project.openRoles || [];
  const technologies = project.technologies || [];
  const programmingLanguages = project.programmingLanguages || [];
  const team = (project.projectTeamMembers || []).map(member => ({
    ...member,
    name: member.fullName,
    role: member.roleInProject,
    profileLink: member.userId ? `/profile/${member.userId}` : null
  }));
  const startDate = project.createdAtUtc ? new Date(project.createdAtUtc).toLocaleDateString() : "-";

  return (
    <div className="project-page">
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back to Projects</span>
        </button>
      </div>

      <div className="project-container">
        {/* Left Column - Project Content */}
        <div className="project-content">
          <span className="project-tagline">{project.tagline || ""}</span>
          <h1 className="project-title">{title}</h1>
          <p className="project-description">{description}</p>
          <div className="project-metadata">
            <div className="metadata-item">
              <Clock size={20} />
              <span>{duration}</span>
            </div>
            <div className="metadata-item">
              <Globe size={20} />
              <span>Public</span>
            </div>
            <div className="metadata-item">
              <Gauge size={20} />
              <span>{difficulty}</span>
            </div>
            <div className="metadata-item">
              <Github size={20} />
              {repositoryLink ? (
                <a href={repositoryLink} target="_blank" rel="noopener noreferrer" className="repo-link">
                  <span style={{ color: '#3b4177' }}>Repository</span>
                </a>
              ) : (
                <span>Repository</span>
              )}
            </div>
          </div>
          {(() => {
            // Determine button based on project source (which endpoint succeeded)
            if (projectSource === 'Template') {
              return (
                <button 
                  className="cta-button" 
                  style={{ marginTop: '1rem' }}
                  onClick={handleCreateProject}
                >
                  Create New Project
                </button>
              );
            } else if (projectSource === 'Active') {
              if (joinRequestPending) {
                return (
                  <button className="cta-button" style={{ marginTop: '1rem', opacity: 0.7 }} disabled>
                    Request Pending
                  </button>
                );
              }
              return (
                <button 
                  className="cta-button" 
                  style={{ marginTop: '1rem' }}
                  onClick={handleRequestToJoin}
                >
                  Request to Join
                </button>
              );
            }
            // Don't render button if source is unknown
            return null;
          })()}
        </div>
        {/* Right Column - Project Visual */}
        <div className="project-visual">
          <div className="visual-container">
            <img 
              src={image} 
              alt={title}
              className="project-showcase"
              onError={e => { e.target.src = "/default-featured-image.png"; }}
            />
          </div>
        </div>
      </div>

      {/* Project Overview Section */}
      <div className="project-overview">
        <div className="overview-container">
          {/* Left Side - Project Goals */}
          <div className="goals-section">
            <h2 className="section-title">Project Goals</h2>
            <div className="goals-list">
              {goals.length > 0 ? goals.map((goal, index) => (
                <div key={index} className="goal-item">
                  <div className="goal-number">{index + 1}</div>
                  <p className="goal-text">{goal}</p>
                </div>
              )) : <span>No goals listed.</span>}
            </div>
          </div>
          {/* Right Side - Open Roles */}
          <div className="roles-section">
            <h2 className="section-title">Open Roles</h2>
            <div className="roles-list">
              {openRoles.length > 0 ? openRoles.map((role, index) => (
                <div key={index} className="role-item">
                  {index === 0 ? <User size={20} /> : <Users size={20} />}
                  <span>{role}</span>
                </div>
              )) : <span>No open roles.</span>}
            </div>
            <button className="contact-button">
              <Mail size={20} />
              <span>Contact the Team</span>
            </button>
          </div>
        </div>
      </div>

      {/* Project Tech Section */}
      <div className="project-tech">
        <div className="tech-container">
          {/* Left Column - Technologies and Languages */}
          <div className="tech-section">
            <h2 className="section-title">Technologies and Languages</h2>
            <div className="tech-subsection">
              <h3 className="subsection-title">Technologies</h3>
              <div className="tech-list">
                {technologies.length > 0 ? technologies.map((tech, index) => (
                  <span key={index} className="tech-pill">{tech}</span>
                )) : <span>No technologies listed.</span>}
              </div>
            </div>
            <div className="tech-subsection">
              <h3 className="subsection-title">Programming Languages</h3>
              <div className="tech-list">
                {programmingLanguages.length > 0 ? programmingLanguages.map((lang, index) => (
                  <span key={index} className="lang-pill">{lang}</span>
                )) : <span>No languages listed.</span>}
              </div>
            </div>
          </div>
          {/* Right Column - Project Details */}
          <div className="details-section">
            <h2 className="section-title">Project Details</h2>
            <div className="details-list">
              <div className="detail-row">
                <span className="detail-label">Difficulty</span>
                <span className="detail-value">{difficulty}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">{startDate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Publicity</span>
                <span className="detail-value">{project.scope || "Public"}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration</span>
                <span className="detail-value">{duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meet Our Team Section */}
      <div className="team-section">
        <div className="team-container">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="team-grid">
            {team.length > 0 ? team.map((member, index) => (
              <div key={index} className="team-member">
                <div 
                  className="member-image" 
                  onClick={() => member.profileLink && navigate(member.profileLink)}
                  style={{ cursor: member.profileLink ? 'pointer' : 'default' }}
                >
                  <img 
                    src={member.profilePictureUrl || "/avatar-default-image.png"} 
                    alt={member.name || member.fullName || "Team Member"}
                    onError={e => { e.target.src = "/avatar-default-image.png"; }}
                  />
                </div>
                <h3 className="member-name">{member.name || member.fullName || "Team Member"}</h3>
                <p className="member-role">{member.role || ""}</p>
                {member.profileLink && (
                  <a 
                    href={member.profileLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="profile-link"
                  >
                    <ExternalLink size={16} />
                    <span>Profile</span>
                  </a>
                )}
              </div>
            )) : <span>No team members listed.</span>}
          </div>
        </div>
      </div>

      {/* Request to Join Modal */}
      <RequestToJoinModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleJoinRequestSubmit}
        availableRoles={openRoles}
        projectTitle={title}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProjectSubmit}
        projectTitle={title}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleToastClose}
        />
      )}
    </div>
  );
}

export default ProjectPage; 