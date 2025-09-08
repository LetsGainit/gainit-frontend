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
    projectStatus?: string;
  };
  onCardClick?: (project: any) => void;
  startingId?: string | null;
  onStartProject?: (projectId: string) => void;
  onConnectRepo?: (projectId: string) => void;
  onViewJoinRequests?: (projectId: string) => void;
  hasRepository?: boolean;
  loadingJoinRequests?: boolean;
  isProjectAdmin?: boolean;
}

const ProjectCardWork: React.FC<ProjectCardWorkProps> = ({ project, onCardClick, startingId, onStartProject, onConnectRepo, onViewJoinRequests, hasRepository, loadingJoinRequests = false, isProjectAdmin = true }) => {
  const navigate = useNavigate();

  // Normalize data to handle different types and missing fields
  const normalizedProject = {
    id: project?.id || project?.projectId || "",
    title: project?.title || project?.projectName || "Untitled Project",
    description: project?.description || project?.projectDescription || "No description available",
    image: project?.image || project?.projectPictureUrl || "/default-featured-image.png",
    technologies: Array.isArray(project?.technologies) ? project.technologies : [],
    status: project?.status || "Active",
    projectStatus: project?.projectStatus || project?.status || "Active"
  };

  const handleCardClick = () => {
    console.log('[ProjectCardWork] Card clicked, project status:', normalizedProject.projectStatus);
    console.log('[ProjectCardWork] Project data:', normalizedProject);
    
    // Block navigation if project is pending
    if (normalizedProject.projectStatus === 'Pending') {
      console.log('[ProjectCardWork] Project is pending, blocking navigation');
      return;
    }
    
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
        {normalizedProject.status && normalizedProject.status !== 'Requested' && (
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
          {(normalizedProject.projectStatus === 'Pending' || normalizedProject.projectStatus === 'Requested') ? (
            <div className="project-card-work__action-buttons">
              {onViewJoinRequests && isProjectAdmin && (
                <button
                  className="btn-secondary px-3 py-2 rounded-lg font-medium text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewJoinRequests(normalizedProject.id);
                  }}
                  disabled={loadingJoinRequests}
                >
                  {loadingJoinRequests ? (
                    <>
                      <div className="button-spinner"></div>
                      Loading...
                    </>
                  ) : (
                    'View Requests'
                  )}
                </button>
              )}
              {onConnectRepo && !hasRepository && isProjectAdmin ? (
                <button
                  className="btn-primary px-4 py-2 rounded-xl font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConnectRepo(normalizedProject.id);
                  }}
                >
                  Connect Repository
                </button>
              ) : onStartProject && isProjectAdmin ? (
                <button
                  className="btn-primary px-4 py-2 rounded-xl font-medium"
                  disabled={startingId === normalizedProject.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (startingId !== normalizedProject.id) {
                      onStartProject(normalizedProject.id);
                    }
                  }}
                >
                  {startingId === normalizedProject.id ? 'Starting…' : 'Start Project'}
                </button>
              ) : null}
            </div>
          ) : (
            <span className="project-card-work__view-link">
              Start Working <FaArrowRight className="project-card-work__arrow-icon" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCardWork;
