import { 
  Facebook, 
  Github, 
  Linkedin, 
  Mail, 
  MessageCircle, 
  MoreVertical,
  ArrowLeft,
  Code2,
  Wrench,
  Terminal,
  ArrowRight,
  Check,
  Hourglass
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../css/ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const { id: userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("technologies");

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/api/users/gainer/${userId}/profile`
        );
        if (!res.ok) throw new Error("Failed to fetch user profile.");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError(err.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  if (loading) {
    return (
      <div className="profile-page" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ fontSize: 24 }}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page" style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d32f2f' }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  // Fallbacks for missing fields
  const fullName = user.fullName || user.name || "Unnamed User";
  const badge = user.badge || "Gainer";
  const educationStatus = user.educationStatus || user.subtitle || "";
  const biography = user.biography || user.about || "";
  const profilePictureUrl = user.profilePictureUrl || user.image || "/avatar-default-image.png";
  const areasOfInterest = user.areasOfInterest || user.interests || [];
  const facebook = user.facebookPageURL || (user.social && user.social.facebook);
  const github = user.gitHubURL || (user.social && user.social.github);
  const linkedin = user.linkedInURL || (user.social && user.social.linkedin);
  const email = user.email || (user.social && user.social.email);
  // Use techExpertise from API
  const techExpertise = user.techExpertise || { programmingLanguages: [], technologies: [], tools: [] };
  const achievements = user.achievements || [];
  const projects = user.participatedProjects || [];

  return (
    <div className="profile-page">
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      {/* Profile Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <div className="profile-image-container">
            <img 
              src={profilePictureUrl} 
              alt={fullName}
              className="profile-image"
              onError={e => { e.target.src = "/avatar-default-image.png"; }}
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
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <Facebook size={20} />
                </a>
              )}
              {github && (
                <a href={github} target="_blank" rel="noopener noreferrer" className="social-icon">
                  <Github size={20} />
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="social-icon">
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

          <div className="profile-actions">
            <button className="action-button message-button">
              <MessageCircle size={20} />
            </button>
            <button className="action-button follow-button">
              Follow
            </button>
            <button className="action-button menu-button">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* About Me Section */}
      <div className="about-section">
        <div className="about-container">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            {biography.split('\n\n').map((paragraph, index) => (
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
              className={`tab ${activeTab === 'languages' ? 'active' : ''}`}
              onClick={() => setActiveTab('languages')}
            >
              <Code2 size={20} />
              <span>Programming Languages</span>
            </button>
            <button 
              className={`tab ${activeTab === 'technologies' ? 'active' : ''}`}
              onClick={() => setActiveTab('technologies')}
            >
              <Terminal size={20} />
              <span>Technologies</span>
            </button>
            <button 
              className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
              onClick={() => setActiveTab('tools')}
            >
              <Wrench size={20} />
              <span>Tools</span>
            </button>
          </div>
          <div className="expertise-content">
            {activeTab === 'languages' && (
              <div className="badge-list">
                {techExpertise.programmingLanguages && techExpertise.programmingLanguages.length > 0 ? techExpertise.programmingLanguages.map((lang, index) => (
                  <span key={index} className="expertise-badge">{lang}</span>
                )) : <span>No data</span>}
              </div>
            )}
            {activeTab === 'technologies' && (
              <div className="badge-list">
                {techExpertise.technologies && techExpertise.technologies.length > 0 ? techExpertise.technologies.map((tech, index) => (
                  <span key={index} className="expertise-badge">{tech}</span>
                )) : <span>No data</span>}
              </div>
            )}
            {activeTab === 'tools' && (
              <div className="badge-list">
                {techExpertise.tools && techExpertise.tools.length > 0 ? techExpertise.tools.map((tool, index) => (
                  <span key={index} className="expertise-badge">{tool}</span>
                )) : <span>No data</span>}
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
            {areasOfInterest && areasOfInterest.length > 0 ? areasOfInterest.map((interest, index) => (
              <span key={index} className="interest-tag">{interest}</span>
            )) : <span>No data</span>}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="achievements-section">
        <div className="achievements-container">
          <h2 className="section-title">Achievements ({achievements.length})</h2>
          <div className="achievements-grid">
            {achievements.length > 0 ? achievements.map((achievement, index) => (
              <div key={index} className={`achievement-card ${achievement.locked ? 'locked' : ''}`}>
                <span className="achievement-icon">🏆</span>
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-description">{achievement.description}</p>
                {achievement.locked && <span className="locked-badge">Locked</span>}
              </div>
            )) : <span>No data</span>}
          </div>
        </div>
      </div>

      {/* User Projects Section */}
      <div className="projects-section">
        <div className="projects-container">
          <h2 className="section-title">Projects</h2>
          <div className="projects-grid">
            {projects.length > 0 ? projects.map((project) => (
              <div key={project.id || project.projectId} className="project-card">
                <div className="project-image-container">
                  <img 
                    src={project.image || project.projectPictureUrl || "/default-featured-image.png"} 
                    alt={project.title || project.projectName}
                    className="project-image"
                    onError={e => { e.target.src = "/default-featured-image.png"; }}
                  />
                  <span className={`status-badge ${project.projectStatus ? project.projectStatus.toLowerCase() : ''}`}>
                    {project.projectStatus && project.projectStatus.toLowerCase() === 'completed' && (
                      <Check className="status-icon" />
                    )}
                    {project.projectStatus && project.projectStatus.toLowerCase() === 'inprogress' && (
                      <Hourglass className="status-icon" />
                    )}
                    {project.projectStatus || 'Unknown'}
                  </span>
                </div>
                <div className="project-content">
                  <div className="project-info">
                    <h3 className="project-title">{project.title || project.projectName}</h3>
                    <p className="project-description">{project.description || project.projectDescription}</p>
                    <p className="project-role">
                      Role: <span className="role-text">{project.role || ""}</span>
                    </p>
                    <div className="project-team">
                      <div className="team-avatars">
                        {project.team && project.team.slice(0, 3).map((member, index) => (
                          <img
                            key={index}
                            src={member.image || "/avatar-default-image.png"}
                            alt={`Team member ${index + 1}`}
                            className="team-avatar"
                          />
                        ))}
                        {project.team && project.team.length > 3 && (
                          <span className="more-members">+{project.team.length - 3}</span>
                        )}
                      </div>
                    </div>
                    <div className="project-technologies">
                      {project.technologies && project.technologies.map((tech, index) => (
                        <span key={index} className="tech-badge">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="button-container">
                    <button 
                      className="view-project-button"
                      onClick={() => navigate(`/project/${project.id || project.projectId}`)}
                    >
                      <ArrowRight size={16} />
                      View Project
                    </button>
                  </div>
                </div>
              </div>
            )) : <span>No data</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage; 