import { Clock, Globe, GitBranch, User, Users, Mail, ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../css/ProjectPage.css";

function ProjectPage() {
  const navigate = useNavigate();
  // Sample project data - replace with actual data from your backend
  const project = {
    tagline: "Education for all",
    title: "AI-Powered Text Simplification",
    description: "This project aims to make complex educational content accessible to everyone through AI-powered text simplification. By leveraging natural language processing and machine learning, we'll create a tool that can automatically simplify academic texts while maintaining their core meaning and educational value. This will help students, non-native speakers, and anyone who struggles with complex language to better understand and engage with educational materials.",
    duration: "3 months",
    scope: "Public",
    methodology: "Agile",
    image: "/default-featured-image.png", // Default project image
    goals: [
      "Develop an AI model that can simplify text while preserving meaning",
      "Create a user-friendly interface for educators to upload and process text",
      "Build browser extensions for easy access to the simplification tool",
      "Ensure accessibility compliance throughout the application"
    ],
    roles: [
      "Fullstack Developer",
      "DevOps Engineer",
      "QA Tester"
    ],
    technologies: [
      "React",
      "TensorFlow",
      "Natural Language Processing",
      "Accessibility Standards"
    ],
    languages: [
      "Python",
      "JavaScript",
      "HTML/CSS",
      "TypeScript"
    ],
    details: {
      difficulty: "Intermediate",
      startDate: "May 15, 2025",
      methodology: "Agile",
      duration: "3 months"
    },
    team: [
      {
        name: "Sarah Johnson",
        role: "Project Lead",
        image: "/team/sarah.jpg",
        profile: "https://linkedin.com/in/sarah-johnson"
      },
      {
        name: "Michael Chen",
        role: "Lead Developer",
        image: "/team/michael.jpg",
        profile: "https://linkedin.com/in/michael-chen"
      },
      {
        name: "Emma Rodriguez",
        role: "UX Designer",
        image: "/team/emma.jpg",
        profile: "https://linkedin.com/in/emma-rodriguez"
      },
      {
        name: "David Kim",
        role: "DevOps Engineer",
        image: "/team/david.jpg",
        profile: "https://linkedin.com/in/david-kim"
      }
    ]
  };

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
          <span className="project-tagline">{project.tagline}</span>
          
          <h1 className="project-title">{project.title}</h1>
          
          <p className="project-description">{project.description}</p>
          
          <div className="project-metadata">
            <div className="metadata-item">
              <Clock size={20} />
              <span>{project.duration}</span>
            </div>
            <div className="metadata-item">
              <Globe size={20} />
              <span>{project.scope}</span>
            </div>
            <div className="metadata-item">
              <GitBranch size={20} />
              <span>{project.methodology}</span>
            </div>
          </div>
          
          <button className="cta-button">
            Request to Join
          </button>
        </div>

        {/* Right Column - Project Visual */}
        <div className="project-visual">
          <div className="visual-container">
            <img 
              src={project.image} 
              alt={project.title}
              className="project-showcase"
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
              {project.goals.map((goal, index) => (
                <div key={index} className="goal-item">
                  <div className="goal-number">{index + 1}</div>
                  <p className="goal-text">{goal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Open Roles */}
          <div className="roles-section">
            <h2 className="section-title">Open Roles</h2>
            <div className="roles-list">
              {project.roles.map((role, index) => (
                <div key={index} className="role-item">
                  {index === 0 ? <User size={20} /> : <Users size={20} />}
                  <span>{role}</span>
                </div>
              ))}
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
                {project.technologies.map((tech, index) => (
                  <span key={index} className="tech-pill">{tech}</span>
                ))}
              </div>
            </div>

            <div className="tech-subsection">
              <h3 className="subsection-title">Programming Languages</h3>
              <div className="tech-list">
                {project.languages.map((lang, index) => (
                  <span key={index} className="lang-pill">{lang}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Project Details */}
          <div className="details-section">
            <h2 className="section-title">Project Details</h2>
            <div className="details-list">
              <div className="detail-row">
                <span className="detail-label">Difficulty</span>
                <span className="detail-value">{project.details.difficulty}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Start Date</span>
                <span className="detail-value">{project.details.startDate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Methodology</span>
                <span className="detail-value">{project.details.methodology}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Duration</span>
                <span className="detail-value">{project.details.duration}</span>
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
            {project.team.map((member, index) => (
              <div key={index} className="team-member">
                <div className="member-image">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    onError={(e) => {
                      e.target.src = "/avatar-default-image.png";
                    }}
                  />
                </div>
                <h3 className="member-name">{member.name}</h3>
                <p className="member-role">{member.role}</p>
                <a 
                  href={member.profile} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="profile-link"
                >
                  <ExternalLink size={16} />
                  <span>Profile</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectPage; 