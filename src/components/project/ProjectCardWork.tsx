import React from 'react';
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import './ProjectCardWork.css';

interface ProjectCardWorkProps {
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
    status?: string;
  };
  onCardClick?: (project: any) => void;
}

const ProjectCardWork: React.FC<ProjectCardWorkProps> = ({ project, onCardClick }) => {
  const navigate = useNavigate();

  // Normalize data to handle different types and missing fields
  const normalizedProject = {
    id: project?.id || project?.projectId || "",
    title: project?.title || project?.projectName || "Untitled Project",
    description: project?.description || project?.projectDescription || "No description available",
    image: project?.image || project?.projectPictureUrl || "/default-featured-image.png",
    technologies: Array.isArray(project?.technologies) ? project.technologies : [],
    status: project?.status || "Active"
  };

  const handleCardClick = () => {
    console.log('[ProjectCardWork] Card clicked, navigating to:', `/work/projects/${normalizedProject.id}`);
    console.log('[ProjectCardWork] Project data:', normalizedProject);
    
    if (onCardClick) {
      onCardClick(normalizedProject);
    } else {
      // Navigate to project work page
      navigate(`/work/projects/${normalizedProject.id}`);
    }
  };

  return (
    <div 
      className="project-card-work"
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
      <div className="project-card-work__image-container">
        <img 
          src={normalizedProject.image}
          alt={normalizedProject.title}
          className="project-card-work__image"
        />
        {normalizedProject.status && (
          <div className="project-card-work__status-badge">
            {normalizedProject.status}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="project-card-work__content">
        {/* Title */}
        <h3 className="project-card-work__title">
          {normalizedProject.title}
        </h3>

        {/* Description */}
        <p className="project-card-work__description">
          {normalizedProject.description}
        </p>

        {/* Tech Stack */}
        <div className="project-card-work__tech-stack">
          {normalizedProject.technologies.slice(0, 3).map((tech, index) => (
            <span key={index} className="project-card-work__tech-item">
              {tech}
            </span>
          ))}
          {normalizedProject.technologies.length > 3 && (
            <span className="project-card-work__tech-more">
              +{normalizedProject.technologies.length - 3}
            </span>
          )}
        </div>

        {/* CTA Link */}
        <div className="project-card-work__cta">
          <span className="project-card-work__view-link">
            Start Working <FaArrowRight className="project-card-work__arrow-icon" />
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCardWork;
