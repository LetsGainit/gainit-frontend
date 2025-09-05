// Updated SearchProjects.jsx with layout and section header centered
import { useState, useEffect, useRef } from "react";
import { Search, Filter } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ProjectCard from "../../components/ProjectCard";
import LoadingIllustration from "../../components/LoadingIllustration";
import { getAllActiveProjects } from "../../services/projectsService";
import "../../css/SearchProjects.css";

function SearchProjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Vector search API function
  const searchVectorAPI = async (query, count = 12) => {
    try {
      setIsSearching(true);
      setError(null);

      const response = await fetch(
        `https://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/api/projects/search/vector?query=${encodeURIComponent(
          query
        )}&count=${count}`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      // Extract only projects from response, ensure it's an array
      const projects = data.projects || [];
      if (!Array.isArray(projects)) {
        console.warn("API response.projects is not an array:", projects);
        return { projects: [] };
      }

      return { projects };
    } catch (error) {
      console.error("Vector search error:", error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    const trimmedQuery = searchTerm.trim();
    if (!trimmedQuery || isSearching) return;

    // Clear previous results and errors to avoid flicker
    setError(null);
    setProjects([]);

    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("q", trimmedQuery);
    newSearchParams.set("count", "12");
    setSearchParams(newSearchParams);
  };

  // Initialize search term from URL params
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    const urlCount = searchParams.get("count") || "12";

    if (urlQuery) {
      setSearchTerm(urlQuery);
      setLoadingInitial(true);
      setLoading(false);
      setError(null);

      // Perform vector search if query exists
      searchVectorAPI(urlQuery, parseInt(urlCount))
        .then((data) => {
          // Ensure we have a valid projects array
          const projectsArray = data.projects || [];
          
          if (!Array.isArray(projectsArray)) {
            setProjects([]);
          } else {
            // Map the vector search response to match the expected ProjectCard structure
            const mappedProjects = projectsArray.map((project) => {
              // Try multiple possible field names for open roles
              const openRoles = project.requiredRoles || 
                               project.openRoles || 
                               project.roles || 
                               project.availableRoles || 
                               project.projectRoles || 
                               [];
              
              return {
                id: project.projectId,
                title: project.projectName ?? "Untitled project",
                description: project.projectDescription ?? "No description",
                technologies: project.technologies ?? [],
                difficulty: project.difficultyLevel ?? "Unknown",
                duration: project.duration ?? "N/A",
                image: project.projectPictureUrl ?? "/default-featured-image.png",
                openRoles: openRoles,
              };
            });
            
            setProjects(mappedProjects);
          }
          setLoadingInitial(false);
        })
        .catch((searchError) => {
          setError(searchError.message || "Failed to search projects.");
          setLoadingInitial(false);
        });
    } else {
      // Load all projects if no search query
      setLoading(true);
      setLoadingInitial(false);
      setError(null);
      getAllActiveProjects()
        .then((data) => {
          // Map the API response to match the expected ProjectCard structure
          const mappedProjects = data.map((project) => {
            // Try multiple possible field names for open roles
            const openRoles = project.requiredRoles || 
                             project.openRoles || 
                             project.roles || 
                             project.availableRoles || 
                             project.projectRoles || 
                             [];
            
            return {
              id: project.projectId,
              title: project.projectName ?? "Untitled project",
              description: project.projectDescription ?? "No description",
              technologies: project.technologies ?? [],
              difficulty: project.difficultyLevel ?? "Unknown",
              duration: project.duration ?? "N/A",
              image: project.projectPictureUrl ?? "/default-featured-image.png",
              openRoles: openRoles,
            };
          });
          
          setProjects(mappedProjects);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Failed to load projects:", error);
          setError("Failed to load projects.");
          setLoading(false);
        });
    }
  }, [searchParams]);

  // Focus search input after scroll reset is complete
  useEffect(() => {
    if (searchInputRef.current && !loadingInitial && !loading) {
      // Use setTimeout to ensure this runs after scroll reset
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus({ preventScroll: true });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loadingInitial, loading]);

  useEffect(() => {
    // Ensure projects is an array before filtering
    if (!Array.isArray(projects)) {
      setFilteredProjects([]);
      return;
    }

    let filtered = projects;
    
    if (searchTerm) {
      filtered = filtered.filter(
        (project) =>
          project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (project.technologies &&
            Array.isArray(project.technologies) &&
            project.technologies.some((tech) =>
              tech?.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }
    
    setFilteredProjects(filtered);
  }, [projects, searchTerm, activeTab]);

  const tabs = ["All", "Ongoing", "Pending"];

  return (
    <div className="search-projects-page">
      <div className="page-header">
        <div className="search-section">
          <h1 className="page-title left-align">Projects</h1>
          <div className="search-row">
            <div className="search-container">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search projects, technologies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="search-input pill"
                disabled={isSearching}
              />
              <button
                className="search-icon-btn"
                onClick={handleSearch}
                aria-label="Search projects"
                disabled={isSearching}
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

      {/* Error banner - inline rendering */}
      {error && (
        <div className="error-banner">
          <div className="error-message">{error}</div>
        </div>
      )}

      <div className="projects-section centered-layout">
        {loadingInitial ? (
          <LoadingIllustration type="initial" />
        ) : loading ? (
          <LoadingIllustration type="initial" />
        ) : Array.isArray(filteredProjects) && filteredProjects.length > 0 ? (
          <>
            <div className="projects-grid">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            {isSearching && (
              <div className="loading-overlay">
                <LoadingIllustration type="search" />
              </div>
            )}
          </>
        ) : (
          <div className="no-results">
            <p>No results</p>
          </div>
        )}
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
