import { FaArrowRight } from "react-icons/fa";

function ProjectCard({ 
  project, 
  variant = "catalog", // "catalog" or "work"
  onCardClick,
  targetRoute 
}) {
  // Normalize data to handle different types and missing fields
  const normalizedProject = {
    id: project?.id || project?.projectId || "",
    title: project?.title || project?.projectName || "Untitled Project",
    description: project?.description || project?.projectDescription || "No description available",
    image: project?.image || project?.projectPictureUrl || "/default-featured-image.png",
    technologies: Array.isArray(project?.technologies) ? project.technologies : [],
    openRoles: Array.isArray(project?.openRoles) ? project.openRoles : [],
    duration: project?.durationText || project?.duration || "N/A"
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(normalizedProject);
    } else if (targetRoute) {
      // Fallback to navigation if no custom handler provided
      window.location.href = targetRoute;
    }
  };

  return (
    <div 
      className="project-card"
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className="project-image-container">
        <img 
          src={normalizedProject.image}
          alt={normalizedProject.title}
          className="project-image"
        />
      </div>

      {/* Content */}
      <div className="project-content">
        {/* Duration and Positions */}
        <div className="project-meta">
          <span className="duration">🗓️ {normalizedProject.duration}</span>
          <span className="positions">
            👥 {normalizedProject.openRoles.length} Open Position{normalizedProject.openRoles.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Title */}
        <h3 className="project-title">
          {normalizedProject.title}
        </h3>

        {/* Description */}
        <p className="project-description">
          {normalizedProject.description}
        </p>

        {/* Tech Stack */}
        <div className="tech-stack">
          {normalizedProject.technologies.slice(0, 4).map((tech, index) => (
            <span key={index} className="tech-item">
              {tech}
            </span>
          ))}
          {normalizedProject.technologies.length > 4 && (
            <span className="tech-more">+{normalizedProject.technologies.length - 4} more</span>
          )}
        </div>

        {/* CTA Link */}
        <div className="project-cta">
          <span className="view-project-link">
            {variant === "work" ? "Start Working" : "View Project"} <FaArrowRight className="arrow-icon" />
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
