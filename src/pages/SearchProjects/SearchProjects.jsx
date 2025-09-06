// Updated SearchProjects.jsx with two sections: Active Projects and Template Projects
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Filter } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProjectCard from "../../components/project/ProjectCard";
import LoadingIllustration from "../../components/LoadingIllustration";
import { getPublicActiveProjects, getPublicTemplateProjects } from "../../services/publicProjectsService";
import "../../css/SearchProjects.css";

function SearchProjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Active Projects State (Projects Open for Joining)
  const [activeProjects, setActiveProjects] = useState([]);
  const [activeProjectsLoading, setActiveProjectsLoading] = useState(false);
  const [activeProjectsError, setActiveProjectsError] = useState(null);
  
  // Template Projects State
  const [templateProjects, setTemplateProjects] = useState([]);
  const [templateProjectsLoading, setTemplateProjectsLoading] = useState(false);
  const [templateProjectsError, setTemplateProjectsError] = useState(null);
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // API function to get active projects (filtered by openPositions > 0)
  const fetchActiveProjects = async () => {
    try {
      setActiveProjectsLoading(true);
      setActiveProjectsError(null);
      
      const data = await getPublicActiveProjects();
      
      // Filter projects that have open positions > 0
      const projectsWithOpenPositions = data.filter(project => {
        const openPos = project.openPositions || 
                       project.availablePositions || 
                       (project.maxPositions && project.currentPositions ? project.maxPositions - project.currentPositions : 0) ||
                       0;
        return openPos > 0;
      });
      
      // If no projects have open positions, show all projects
      const projectsToShow = projectsWithOpenPositions.length > 0 ? projectsWithOpenPositions : data;
      
      // Map the API response to match the expected ProjectCard structure
      const mappedProjects = projectsToShow.map((project) => {
        // Extract roles from projectTeamMembers or other available fields
        const openRoles = project.projectTeamMembers ? 
                         project.projectTeamMembers.map(member => member.roleInProject).filter(role => role) :
                         project.requiredRoles || 
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
          duration: project.durationText ?? project.duration ?? "N/A",
          image: project.projectPictureUrl ?? "/default-featured-image.png",
          openRoles: openRoles,
        };
      });
      
      setActiveProjects(mappedProjects);
    } catch (error) {
      console.error("Failed to load active projects:", error);
      setActiveProjectsError("Failed to load active projects.");
    } finally {
      setActiveProjectsLoading(false);
    }
  };

  // API function to get template projects
  const fetchTemplateProjects = async () => {
    try {
      setTemplateProjectsLoading(true);
      setTemplateProjectsError(null);
      
      const data = await getPublicTemplateProjects();
      
      // Map the API response to match the expected ProjectCard structure
      const mappedProjects = data.map((project) => {
        const openRoles = project.requiredRoles || 
                         project.openRoles || 
                         project.roles || 
                         project.availableRoles || 
                         project.projectRoles || 
                         [];
        
        return {
          id: project.projectId || project.id,
          title: (project.projectName || project.name) ?? "Untitled project",
          description: (project.projectDescription || project.description) ?? "No description",
          technologies: project.technologies ?? [],
          difficulty: (project.difficultyLevel || project.difficulty) ?? "Unknown",
          duration: (project.durationText || project.duration) ?? "N/A",
          image: (project.projectPictureUrl || project.imageUrl) ?? "/default-featured-image.png",
          openRoles: openRoles,
        };
      });
      
      setTemplateProjects(mappedProjects);
    } catch (error) {
      console.error("Failed to load template projects:", error);
      setTemplateProjectsError("Failed to load template projects.");
    } finally {
      setTemplateProjectsLoading(false);
    }
  };

  const handleSearch = () => {
    const trimmedQuery = searchTerm.trim();
    if (!trimmedQuery || isSearching) return;

    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("q", trimmedQuery);
    setSearchParams(newSearchParams);
  };

  // Initialize search term from URL params and load data
  useEffect(() => {
    const urlQuery = searchParams.get("q");
    if (urlQuery) {
      setSearchTerm(urlQuery);
    }
    
    // Load both sections on component mount (public access)
    fetchActiveProjects();
    fetchTemplateProjects();
  }, [searchParams]);

  // Focus search input after component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus({ preventScroll: true });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const tabs = ["All", "Templates", "Open for Joining"];

  // Filter projects based on search term
  const filterProjects = (projects) => {
    if (!searchTerm) return projects;
    
    return projects.filter((project) =>
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.technologies &&
        Array.isArray(project.technologies) &&
        project.technologies.some((tech) =>
          tech?.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );
  };

  // Determine which sections should be visible based on active tab
  const shouldShowActiveProjects = activeTab === "All" || activeTab === "Open for Joining";
  const shouldShowTemplateProjects = activeTab === "All" || activeTab === "Templates";

  // Project limit for "All" tab (2 grid rows = 8 projects max, assuming 4 columns)
  const PROJECTS_LIMIT = 8;
  const isAllTab = activeTab === "All";

  // Handle "Find more" button clicks
  const handleFindMoreActive = () => {
    setActiveTab("Open for Joining");
  };

  const handleFindMoreTemplates = () => {
    setActiveTab("Templates");
  };

  const handleProjectClick = useCallback((project) => {
    // Navigate to project details page
    navigate(`/project/${project.id}`);
  }, [navigate]);

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

      {/* Active Projects Section */}
      {shouldShowActiveProjects && (
        <div className="projects-section">
          <div className="page-container">
            <h2 className="section-title">Projects Open for Joining</h2>
            
            {activeProjectsLoading ? (
              <LoadingIllustration type="initial" />
            ) : Array.isArray(activeProjects) && activeProjects.length > 0 ? (
              <>
                <div className="projects-grid">
                  {filterProjects(activeProjects)
                    .slice(0, isAllTab ? PROJECTS_LIMIT : undefined)
                    .map((project) => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        variant="catalog"
                        onCardClick={handleProjectClick}
                      />
                    ))}
                </div>
                {isAllTab && filterProjects(activeProjects).length > PROJECTS_LIMIT && (
                  <div className="find-more-container">
                    <button 
                      className="find-more-btn"
                      onClick={handleFindMoreActive}
                    >
                      Find more active projects
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-results">
                <p>No active projects available for joining</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Template Projects Section */}
      {shouldShowTemplateProjects && (
        <div className="projects-section">
          <div className="page-container">
            <h2 className="section-title">Template Projects</h2>
            
            {templateProjectsLoading ? (
              <LoadingIllustration type="initial" />
            ) : Array.isArray(templateProjects) && templateProjects.length > 0 ? (
              <>
                <div className="projects-grid">
                  {filterProjects(templateProjects)
                    .slice(0, isAllTab ? PROJECTS_LIMIT : undefined)
                    .map((project) => (
                      <ProjectCard 
                        key={project.id} 
                        project={project} 
                        variant="catalog"
                        onCardClick={handleProjectClick}
                      />
                    ))}
                </div>
                {isAllTab && filterProjects(templateProjects).length > PROJECTS_LIMIT && (
                  <div className="find-more-container">
                    <button 
                      className="find-more-btn"
                      onClick={handleFindMoreTemplates}
                    >
                      Find more template projects
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="no-results">
                <p>No template projects available</p>
              </div>
            )}
          </div>
        </div>
      )}
      <footer className="footer">
        <div className="footer-content">
          © {new Date().getFullYear()} GainIt. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default SearchProjects;
