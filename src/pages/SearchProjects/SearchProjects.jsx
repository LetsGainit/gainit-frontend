// Updated SearchProjects.jsx with layout and section header centered
import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import ProjectCard from "../../components/ProjectCard";
import { getAllActiveProjects } from "../../services/projectsService";
import "../../css/SearchProjects.css";

function SearchProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState([]);

  const handleSearch = () => {
    console.log("Searching for:", searchTerm);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    getAllActiveProjects()
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load projects.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = projects;
    if (searchTerm) {
      filtered = filtered.filter((project) =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.technologies && project.technologies.some((tech) =>
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    }
    setFilteredProjects(filtered);
  }, [projects, searchTerm, activeTab]);

  const tabs = ["All", "Ongoing", "Pending"];

  if (loading) {
    return (
      <div className="search-projects-page">
        <div className="loading-container">
          <div className="spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-projects-page">
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-projects-page">
      <div className="page-header">
        <div className="search-section">
          <h1 className="page-title left-align">Projects</h1>
          <div className="search-row">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search projects, technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="search-input pill"
              />
              <button
                className="search-icon-btn"
                onClick={handleSearch}
                aria-label="Search projects"
              >
                <span className="search-icon-svg-wrapper">
                  <Search size={20} strokeWidth={2.5} color="#fff" />
                </span>
              </button>
            </div>
            <button className="filter-btn" aria-label="Filter projects">
              <Filter size={20} />
              <span>Filters</span>
            </button>
          </div>
          <div className="filter-tabs left-align">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`tab-btn pill ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="projects-section centered-layout">
        <div className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="no-projects">
              <p>No projects found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
      <footer className="footer">
        <div className="footer-content">
          © {new Date().getFullYear()} GainIt. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default SearchProjects;