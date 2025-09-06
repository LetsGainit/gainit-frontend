import {
  Facebook,
  Github,
  Linkedin,
  Mail,
  ArrowLeft,
  Code2,
  Wrench,
  Terminal,
  ArrowRight,
  Check,
  Hourglass,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { fetchUserProfile } from "../../auth/auth";
import { getDisplayNameForRole, isValidRole } from "../../utils/userUtils";
import Toast from "../../components/Toast";
import ProjectCard from "../../components/project/ProjectCard";
import "../../css/ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("technologies");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("error");
  const [userProjects, setUserProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Extract role from URL path
  const getRoleFromPath = () => {
    const pathParts = location.pathname.split("/");
    if (pathParts.length >= 3 && pathParts[1] === "profile") {
      const role = pathParts[2];
      if (isValidRole(role)) {
        return role;
      }
    }
    return "gainer"; // Default fallback
  };

  const userRole = getRoleFromPath();

  // Fetch user projects
  const fetchUserProjects = useCallback(async (userId) => {
    if (!userId) return;
    
    setProjectsLoading(true);
    try {
      const response = await fetch(
        `https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/api/projects/user/${userId}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user projects: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Map the API response to match the expected ProjectCard structure
      const mappedProjects = data.map((project) => {
        // Try multiple possible field names for open roles
        const openRoles = project.requiredRoles || 
                         project.openRoles || 
                         project.roles || 
                         project.availableRoles || 
                         project.projectRoles || 
                         [];
        
        return {
          id: project.projectId,
          title: project.projectName ?? "Untitled project",
          description: project.projectDescription ?? "No description",
          technologies: project.technologies ?? [],
          difficulty: project.difficultyLevel ?? "Unknown",
          duration: project.durationText ?? project.duration ?? "N/A",
          image: project.projectPictureUrl ?? "/default-featured-image.png",
          openRoles: openRoles,
          projectStatus: project.projectStatus,
          role: project.role || project.roleInProject,
        };
      });
      
      setUserProjects(mappedProjects);
    } catch (error) {
      console.error("Failed to fetch user projects:", error);
      setUserProjects([]);
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  // Handle project click
  const handleProjectClick = useCallback((project) => {
    navigate(`/project/${project.id}`);
  }, [navigate]);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);

      try {
        // Check if user is authenticated
        if (!isAuthenticated) {
          setError("Authentication required. Please sign in to view profiles.");
          setLoading(false);
          return;
        }

        // Fetch profile data from the appropriate endpoint based on role
        const data = await fetchUserProfile(userRole, userId);
        setUser(data);
        
        // Fetch user projects
        await fetchUserProjects(userId);
      } catch (err) {
        console.error("Failed to fetch profile:", err);

        if (err.message.includes("401") || err.message.includes("403")) {
          setError("Authentication required. Please sign in again.");
        } else if (err.message.includes("404")) {
          setError("Profile not found.");
        } else {
          setError(err.message || "Failed to load profile.");
        }

        // Show error toast
        setToastMessage(err.message || "Failed to load profile.");
        setToastType("error");
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchUser();
    }
  }, [userId, userRole, isAuthenticated]);

  const handleToastClose = () => {
    setShowToast(false);
  };

  if (loading) {
    return (
      <div
        className="profile-page"
        style={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="spinner" style={{ fontSize: 24 }}>
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="profile-page"
        style={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#d32f2f",
        }}
      >
        <div>
          <h2>Error Loading Profile</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/")}
            style={{
              marginTop: "16px",
              padding: "8px 16px",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="profile-page"
        style={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>No profile data available.</div>
      </div>
    );
  }

  // Fallbacks for missing fields
  const fullName = user.fullName || user.name || "Unnamed User";
  const badge = user.badge || getDisplayNameForRole(userRole);
  const educationStatus = user.educationStatus || user.subtitle || "";
  const biography = user.biography || user.about || "";
  const profilePictureUrl =
    user.profilePictureUrl || user.image || "/avatar-default-image.png";
  const areasOfInterest = user.areasOfInterest || user.interests || [];
  const facebook =
    user.facebookPageURL || (user.social && user.social.facebook);
  const github = user.gitHubURL || (user.social && user.social.github);
  const linkedin = user.linkedInURL || (user.social && user.social.linkedin);
  const email = user.email || (user.social && user.social.email);
  // Use techExpertise from API
  const techExpertise = user.techExpertise || {
    programmingLanguages: [],
    technologies: [],
    tools: [],
  };
  const achievements = user.achievements || [];
  const projects = user.participatedProjects || [];

  return (
    <>
      <div className="profile-page">
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
        
        <div className="profile-content">

        {/* Profile Header Section */}
        <div className="profile-header">
          <div className="header-content">
            <div className="profile-image-container">
              <img
                src={profilePictureUrl}
                alt={fullName}
                className="profile-image"
                onError={(e) => {
                  e.target.src = "/avatar-default-image.png";
                }}
              />
            </div>

            <div className="profile-info">
              <div className="name-badge">
                <h1 className="profile-name">{fullName}</h1>
                <span className="profile-badge">{badge}</span>
              </div>
              <p className="profile-subtitle">{educationStatus}</p>
              <div className="social-icons">
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                  >
                    <Facebook size={20} />
                  </a>
                )}
                {github && (
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                  >
                    <Github size={20} />
                  </a>
                )}
                {linkedin && (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-icon"
                  >
                    <Linkedin size={20} />
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`} className="social-icon">
                    <Mail size={20} />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* About Me Section */}
        <div className="about-section">
          <div className="about-container">
            <h2 className="section-title">About Me</h2>
            <div className="about-content">
              {biography.split("\n\n").map((paragraph, index) => (
                <p key={index} className="about-paragraph">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Expertise Section */}
        <div className="expertise-section">
          <div className="expertise-container">
            <h2 className="section-title">Expertise</h2>
            <div className="tabs">
              <button
                className={`tab ${activeTab === "languages" ? "active" : ""}`}
                onClick={() => setActiveTab("languages")}
              >
                <Code2 size={20} />
                <span>Programming Languages</span>
              </button>
              <button
                className={`tab ${
                  activeTab === "technologies" ? "active" : ""
                }`}
                onClick={() => setActiveTab("technologies")}
              >
                <Terminal size={20} />
                <span>Technologies</span>
              </button>
              <button
                className={`tab ${activeTab === "tools" ? "active" : ""}`}
                onClick={() => setActiveTab("tools")}
              >
                <Wrench size={20} />
                <span>Tools</span>
              </button>
            </div>
            <div className="expertise-content">
              {activeTab === "languages" && (
                <div className="badge-list">
                  {techExpertise.programmingLanguages &&
                  techExpertise.programmingLanguages.length > 0 ? (
                    techExpertise.programmingLanguages.map((lang, index) => (
                      <span key={index} className="expertise-badge">
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span>No data</span>
                  )}
                </div>
              )}
              {activeTab === "technologies" && (
                <div className="badge-list">
                  {techExpertise.technologies &&
                  techExpertise.technologies.length > 0 ? (
                    techExpertise.technologies.map((tech, index) => (
                      <span key={index} className="expertise-badge">
                        {tech}
                      </span>
                    ))
                  ) : (
                    <span>No data</span>
                  )}
                </div>
              )}
              {activeTab === "tools" && (
                <div className="badge-list">
                  {techExpertise.tools && techExpertise.tools.length > 0 ? (
                    techExpertise.tools.map((tool, index) => (
                      <span key={index} className="expertise-badge">
                        {tool}
                      </span>
                    ))
                  ) : (
                    <span>No data</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Areas of Interest Section */}
        <div className="interests-section">
          <div className="interests-container">
            <h2 className="section-title">Areas of Interest</h2>
            <div className="interests-list">
              {areasOfInterest && areasOfInterest.length > 0 ? (
                areasOfInterest.map((interest, index) => (
                  <span key={index} className="interest-tag">
                    {interest}
                  </span>
                ))
              ) : (
                <span>No data</span>
              )}
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="achievements-section">
          <div className="achievements-container">
            <h2 className="section-title">
              Achievements ({achievements.length})
            </h2>
            <div className="achievements-grid">
              {achievements.length > 0 ? (
                achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`achievement-card ${
                      achievement.locked ? "locked" : ""
                    }`}
                  >
                    <span className="achievement-icon">🏆</span>
                    <h3 className="achievement-title">{achievement.title}</h3>
                    <p className="achievement-description">
                      {achievement.description}
                    </p>
                    {achievement.locked && (
                      <span className="locked-badge">Locked</span>
                    )}
                  </div>
                ))
              ) : (
                <span>No data</span>
              )}
            </div>
          </div>
        </div>

        {/* User Projects Section */}
        <div className="projects-section">
          <div className="projects-container">
            <h2 className="section-title">Projects ({userProjects.length})</h2>
            {projectsLoading ? (
              <div className="loading-container">
                <div className="spinner">Loading projects...</div>
              </div>
            ) : userProjects.length > 0 ? (
              <div className="projects-grid">
                {userProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    variant="catalog"
                    onCardClick={handleProjectClick}
                  />
                ))}
              </div>
            ) : (
              <div className="no-projects">
                <p>No projects found for this user.</p>
              </div>
            )}
          </div>
        </div>
        
        </div>
      </div>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleToastClose}
        />
      )}
    </>
  );
}

export default ProfilePage;
