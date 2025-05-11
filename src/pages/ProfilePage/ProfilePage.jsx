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
  ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../../css/ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("technologies");

  const user = {
    name: "Ziv Francis",
    badge: "Builder",
    subtitle: "Final Year Computer Science Student",
    image: "/avatar-default-image.png",
    social: {
      facebook: "https://facebook.com/maya.cohen",
      github: "https://github.com/mayacohen",
      linkedin: "https://linkedin.com/in/maya-cohen",
      email: "mailto:maya.cohen@example.com"
    },
    about: `I'm a passionate computer science student with a keen interest in artificial intelligence and web development. Currently in my final year, I'm focusing on building innovative solutions that make a real impact.

My journey in tech began with simple HTML websites, and now I'm diving deep into machine learning and full-stack development. I love collaborating on open-source projects and contributing to the tech community.

When I'm not coding, you'll find me participating in hackathons, mentoring junior developers, or exploring new technologies. I believe in continuous learning and sharing knowledge with others.`,
    expertise: {
      languages: ["JavaScript", "Python", "TypeScript", "Java", "C++"],
      technologies: ["React", "Redux", "Tailwind CSS", "Next.js", "Node.js", "Express"],
      tools: ["Git", "Docker", "VS Code", "Figma", "Postman"]
    },
    interests: [
      "Frontend Development",
      "Clean Code",
      "UX/UI Integration",
      "Social Impact Projects",
      "Open Source",
      "Machine Learning"
    ],
    achievements: [
      {
        icon: "🏆",
        title: "Ready to Work",
        description: "Completed 5 major projects",
        locked: false
      },
      {
        icon: "🚀",
        title: "First Steps",
        description: "Joined the platform",
        locked: false
      },
      {
        icon: "👥",
        title: "Team Player",
        description: "Collaborated on 3 projects",
        locked: true
      },
      {
        icon: "⭐",
        title: "Community Star",
        description: "Helped 10+ developers",
        locked: true
      }
    ],
    projects: [
      {
        id: 1,
        title: "AI-Powered Text Simplification",
        description: "Making complex educational content accessible through AI-powered text simplification.",
        image: "/default-featured-image.png",
        status: "In Progress",
        role: "Frontend Developer",
        team: [
          { id: 1, image: "/avatar-default-image.png" },
          { id: 2, image: "/avatar-default-image.png" },
          { id: 3, image: "/avatar-default-image.png" },
          { id: 4, image: "/avatar-default-image.png" }
        ],
        technologies: ["React", "Node.js", "Python", "TensorFlow"]
      },
      {
        id: 2,
        title: "Community Learning Platform",
        description: "A platform connecting learners with mentors in their local community.",
        image: "/default-featured-image.png",
        status: "Completed",
        role: "Full Stack Developer",
        team: [
          { id: 1, image: "/avatar-default-image.png" },
          { id: 2, image: "/avatar-default-image.png" }
        ],
        technologies: ["React", "Express", "MongoDB", "Socket.io"]
      },
      {
        id: 3,
        title: "Smart Study Scheduler",
        description: "AI-powered study schedule optimization for students.",
        image: "/default-featured-image.png",
        status: "In Progress",
        role: "Backend Developer",
        team: [
          { id: 1, image: "/avatar-default-image.png" },
          { id: 2, image: "/avatar-default-image.png" },
          { id: 3, image: "/avatar-default-image.png" }
        ],
        technologies: ["Python", "Django", "PostgreSQL", "Redis"]
      }
    ]
  };

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
              src={user.image} 
              alt={user.name}
              className="profile-image"
            />
          </div>
          
          <div className="profile-info">
            <div className="name-badge">
              <h1 className="profile-name">{user.name}</h1>
              <span className="profile-badge">{user.badge}</span>
            </div>
            <p className="profile-subtitle">{user.subtitle}</p>
            
            <div className="social-icons">
              <a href={user.social.facebook} target="_blank" rel="noopener noreferrer" className="social-icon">
                <Facebook size={20} />
              </a>
              <a href={user.social.github} target="_blank" rel="noopener noreferrer" className="social-icon">
                <Github size={20} />
              </a>
              <a href={user.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon">
                <Linkedin size={20} />
              </a>
              <a href={user.social.email} className="social-icon">
                <Mail size={20} />
              </a>
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
            {user.about.split('\n\n').map((paragraph, index) => (
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
                {user.expertise.languages.map((lang, index) => (
                  <span key={index} className="expertise-badge">{lang}</span>
                ))}
              </div>
            )}
            {activeTab === 'technologies' && (
              <div className="badge-list">
                {user.expertise.technologies.map((tech, index) => (
                  <span key={index} className="expertise-badge">{tech}</span>
                ))}
              </div>
            )}
            {activeTab === 'tools' && (
              <div className="badge-list">
                {user.expertise.tools.map((tool, index) => (
                  <span key={index} className="expertise-badge">{tool}</span>
                ))}
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
            {user.interests.map((interest, index) => (
              <span key={index} className="interest-tag">{interest}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Section */}
      <div className="achievements-section">
        <div className="achievements-container">
          <h2 className="section-title">Achievements ({user.achievements.length})</h2>
          <div className="achievements-grid">
            {user.achievements.map((achievement, index) => (
              <div key={index} className={`achievement-card ${achievement.locked ? 'locked' : ''}`}>
                <span className="achievement-icon">{achievement.icon}</span>
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-description">{achievement.description}</p>
                {achievement.locked && <span className="locked-badge">Locked</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Projects Section */}
      <div className="projects-section">
        <div className="projects-container">
          <h2 className="section-title">Projects</h2>
          <div className="projects-grid">
            {user.projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-image-container">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="project-image"
                  />
                  <span className={`status-badge ${project.status === 'completed' ? 'completed' : 'in-progress'}`}>
                    {project.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                </div>
                
                <div className="project-content">
                  <div className="project-info">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-description">{project.description}</p>
                    <p className="project-role">
                      Role: <span className="role-text">{project.role}</span>
                    </p>
                    <div className="project-team">
                      <div className="team-avatars">
                        {project.team.slice(0, 3).map((member, index) => (
                          <img
                            key={index}
                            src={member.image}
                            alt={`Team member ${index + 1}`}
                            className="team-avatar"
                          />
                        ))}
                        {project.team.length > 3 && (
                          <span className="more-members">+{project.team.length - 3}</span>
                        )}
                      </div>
                    </div>
                    <div className="project-technologies">
                      {project.technologies.map((tech, index) => (
                        <span key={index} className="tech-badge">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="button-container">
                    <button 
                      className="view-project-button"
                      onClick={() => navigate(`/project/${project.id}`)}
                    >
                      <ArrowRight size={16} />
                      View Project
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage; 