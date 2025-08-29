import ProjectCard from "../../components/ProjectCard";
import Footer from "../../components/Footer";
import SearchHero from "../../components/SearchHero";
import "../../css/HomePage.css";
import { getAllActiveProjects } from "../../services/projectsService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await getAllActiveProjects();
        const mappedProjects = data.map((project) => ({
          id: project.projectId,
          title: project.projectName ?? "Untitled project",
          description: project.projectDescription ?? "No description",
          technologies: project.technologies ?? [],
          difficulty: project.difficultyLevel ?? "Unknown",
          duration: project.duration ?? "N/A",
          image: project.projectPictureUrl ?? "/default-featured-image.png",
          openPositions: project.requiredRoles?.length ?? 0,
        }));

        setProjects(mappedProjects.slice(0, 3));
      } catch (error) {
        console.error("Error loading active projects", error);
      }
    }

    fetchProjects();
  }, []);

  const handleSearch = (query) => {
    console.log("Search query:", query);
    // TODO: Implement search functionality
    // For now, just log the query
  };

  const handleViewMoreProjects = () => {
    navigate("/search-projects");
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <h1 className="hero-headline">
          Let your skills shine. Gain real experience today.
        </h1>
        <p className="hero-subheading">
          Gain hands-on experience, build real projects, and let your portfolio
          speak for you
        </p>
        {/* New Search Hero Component */}
        <SearchHero onSearch={handleSearch} />
      </div>

      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">Explore Projects</h2>
      </div>

      {/* Projects Section */}
      <div className="projects-section">
        {/* Projects Grid */}
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* View More Projects Button */}
      <div className="view-more-container">
        <button className="view-more-button" onClick={handleViewMoreProjects}>
          View More Projects
        </button>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default HomePage;
