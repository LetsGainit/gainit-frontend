import React from 'react';
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import './ProjectCard.css';

interface ProjectCardProps {
  project: {
    id?: string;
    projectId?: string;
    title?: string;
    projectName?: string;
    description?: string;
    projectDescription?: string;
    image?: string;
    projectPictureUrl?: string;
    technologies?: string[];
    openRoles?: string[];
    duration?: string;
    durationText?: string;
    status?: string;
    projectStatus?: string;
  };
  onCardClick?: (project: any) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onCardClick }) => {
  const navigate = useNavigate();

  // Normalize data to handle different types and missing fields
  const normalizedProject = {
    id: (project?.id || project?.projectId || (project as any)?.Id || (project as any)?.ID || (project as any)?.projectID || (project as any)?.ProjectId || (project as any)?.ProjectID || "") as string,
    title: project?.title || project?.projectName || "Untitled Project",
    description: project?.description || project?.projectDescription || "No description available",
    image: project?.image || project?.projectPictureUrl || "/default-featured-image.png",
    technologies: Array.isArray(project?.technologies) ? project.technologies : [],
    openRoles: Array.isArray(project?.openRoles) ? project.openRoles : [],
    duration: project?.durationText || project?.duration || "N/A",
    projectStatus: project?.projectStatus || project?.status || "Active"
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(normalizedProject);
    } else {
      // Navigate to project page
      navigate(`/project/${normalizedProject.id}`);
    }
  };

  return (
    <div 
      className="project-card-catalog"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Image Container */}
      <div className="project-card-catalog__image-container">
        <img 
          src={normalizedProject.image}
          alt={normalizedProject.title}
          className="project-card-catalog__image"
        />
      </div>

      {/* Content */}
      <div className="project-card-catalog__content">
        {/* Duration and Positions */}
        <div className="project-card-catalog__meta">
          <span className="project-card-catalog__duration">
            🗓️ {normalizedProject.duration}
          </span>
          <span className="project-card-catalog__positions">
            👥 {normalizedProject.openRoles.length} Open Position{normalizedProject.openRoles.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Title */}
        <h3 className="project-card-catalog__title">
          {normalizedProject.title}
        </h3>

        {/* Description */}
        <p className="project-card-catalog__description">
          {normalizedProject.description}
        </p>

        {/* Tech Stack */}
        <div className="project-card-catalog__tech-stack">
          {normalizedProject.technologies.slice(0, 4).map((tech, index) => (
            <span key={index} className="project-card-catalog__tech-item">
              {tech}
            </span>
          ))}
          {normalizedProject.technologies.length > 4 && (
            <span className="project-card-catalog__tech-more">
              +{normalizedProject.technologies.length - 4} more
            </span>
          )}
        </div>

        {/* CTA Link */}
        <div className="project-card-catalog__cta">
          <span className="project-card-catalog__view-link">
            View Project <FaArrowRight className="project-card-catalog__arrow-icon" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
