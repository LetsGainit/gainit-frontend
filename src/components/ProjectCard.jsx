function ProjectCard({ project }) {
  function onSeeMoreClick() {
    alert("clicked");
  }

  return (
    <div className="project-card">
      <div className="project-image">
        <img 
          src={project.image || "/default-featured-image.png"}
          alt={project.title || "Project Image"}
          className="project-image"
        />
      </div>
      <div className="project-seeMoreButton">
        <button className="seeMore-button" onClick={onSeeMoreClick}>
          see more
        </button>
      </div>
      <div className="project-info">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </div>
    </div>
  );
}

export default ProjectCard;
