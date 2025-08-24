import ProjectCard from "../../components/ProjectCard";
import Footer from "../../components/Footer";
import SearchHero from "../../components/SearchHero";
import "../../css/HomePage.css";
import { getAllActiveProjects } from "../../services/projectsService";
import { useEffect, useState } from "react";

function HomePage() {
  const [projects, setProjects] = useState([]);

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

      {/* Projects Section */}
      <div className="projects-section">
        {/* Projects Grid */}
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default HomePage;
