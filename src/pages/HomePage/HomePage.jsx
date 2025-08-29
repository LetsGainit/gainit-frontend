import ProjectCard from "../../components/ProjectCard";
import Footer from "../../components/Footer";
import SearchHero from "../../components/SearchHero";
import "../../css/HomePage.css";
import { getAllActiveProjects } from "../../services/projectsService";
<<<<<<< HEAD
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
=======
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { apiScopes } from "../../auth/msalConfig";

function HomePage() {
  const [projects, setProjects] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { instance, accounts } = useMsal();
>>>>>>> Azure_login

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
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
        // If it's an auth error, we might need to handle it differently
        if (error.response?.status === 401) {
          console.log("Authentication required for projects");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

<<<<<<< HEAD
  const handleSearch = (query) => {
    console.log("Search query:", query);
    // TODO: Implement search functionality
    // For now, just log the query
  };

  const handleViewMoreProjects = () => {
    navigate("/search-projects");
=======
  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;

    const target = `/search-projects?query=${encodeURIComponent(q)}`;

    if (accounts.length === 0) {
      try {
        await instance.loginRedirect({
          scopes: apiScopes,
          redirectStartPage: `${window.location.origin}${target}`,
        });
      } catch (error) {
        console.error("Login redirect failed:", error);
      }
      return;
    }

    navigate(target);
  }, [accounts.length, instance, navigate, query]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
>>>>>>> Azure_login
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
<<<<<<< HEAD
        {/* New Search Hero Component */}
        <SearchHero onSearch={handleSearch} />
      </div>

      {/* Section Header */}
      <div className="section-header">
        <h2 className="section-title">Explore Projects</h2>
=======
        {/* Search Bar */}
        <div className="search-container search-bar-bubble">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell us your dream role and we'll find the perfect project for you"
            className="search-input"
            style={{ paddingRight: 56 }} // extra right padding for button
          />
          <button
            className="search-button-inside"
            type="button"
            aria-label="Search"
            onClick={handleSearch}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <Search
              size={22}
              color="white"
              stroke="white"
              fill="none"
              style={{ display: "block" }}
            />
          </button>
        </div>
>>>>>>> Azure_login
      </div>

      {/* Projects Section */}
      <div className="projects-section">
        {/* Projects Grid */}
        <div className="projects-grid">
          {loading ? (
            <div
              style={{
                textAlign: "center",
                gridColumn: "1 / -1",
                padding: "2rem",
              }}
            >
              Loading projects...
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
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
