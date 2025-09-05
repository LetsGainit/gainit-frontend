import { useNavigate } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

function ProjectCard({ project }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <div 
      className="project-card"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="project-image-container">
        <img 
          src={project.image || "/default-featured-image.png"}
          alt={project.title || "Project Image"}
          className="project-image"
        />
      </div>

      {/* Content */}
      <div className="project-content">
        {/* Duration and Positions */}
        <div className="project-meta">
          <span className="duration">🗓️ {project.duration || "3 Months"}</span>
          <span className="positions">👥 {project.openRoles?.length || 0} Open Position{(project.openRoles?.length || 0) !== 1 ? 's' : ''}</span>
        </div>

        {/* Title */}
        <h3 className="project-title">
          {project.title}
        </h3>

        {/* Description */}
        <p className="project-description">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="tech-stack">
          {project.technologies?.slice(0, 4).map((tech, index) => (
            <span key={index} className="tech-item">
              {tech}
            </span>
          ))}
          {project.technologies && project.technologies.length > 4 && (
            <span className="tech-more">+{project.technologies.length - 4} more</span>
          )}
        </div>

        {/* CTA Link */}
        <div className="project-cta">
          <span className="view-project-link">
            View Project <FaArrowRight className="arrow-icon" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
