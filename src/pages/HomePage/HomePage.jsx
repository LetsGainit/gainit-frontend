import ProjectCard from "../../components/project/ProjectCard";
import Footer from "../../components/Footer";
import SearchHero from "../../components/SearchHero";
import "../../css/HomePage.css";
import { getAllActiveProjects, getMatchedProjects, getCurrentUser } from "../../services/projectsService";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { apiScopes } from "../../auth/msalConfig";
import { useAuth } from "../../hooks/useAuth";

function HomePage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gainitUser, setGainitUser] = useState(null);
  const navigate = useNavigate();
  const { instance, accounts } = useMsal();
  const { userInfo } = useAuth();

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        
        // Check if user is authenticated and has userInfo
        const isAuthenticated = accounts.length > 0 && userInfo?.userId;
        
        let data;
        if (isAuthenticated) {
          try {
            // Use cached GainIt user if available, otherwise fetch it
            let currentUser = gainitUser;
            if (!currentUser) {
              console.log("[Home] Fetching GainIt user info via /api/users/me");
              currentUser = await getCurrentUser();
              setGainitUser(currentUser);
            }
            
            console.log(`[Home] Using GainIt userId from /me: ${currentUser.id}`);
            console.log(`[Home] Calling /api/match/profile with userId=${currentUser.id}, count=5`);
            data = await getMatchedProjects(currentUser.id, 5);
          } catch (meError) {
            console.warn("[Home] Failed to fetch GainIt user info, falling back to active projects:", meError);
            data = await getAllActiveProjects();
          }
        } else {
          console.log("[Home] Fallback to active projects (guest)");
          data = await getAllActiveProjects();
        }
        
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
            duration: project.durationText ?? project.duration ?? "N/A",
            image: project.projectPictureUrl ?? "/default-featured-image.png",
            openRoles: openRoles,
          };
        });

        setProjects(mappedProjects.slice(0, 3));
      } catch (error) {
        console.error("Error loading projects", error);
        // If it's an auth error, we might need to handle it differently
        if (error.response?.status === 401) {
          console.log("Authentication required for projects");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [accounts.length, userInfo?.userId]);

  const handleSearch = useCallback(async (query) => {
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
  }, [accounts.length, instance, navigate]);

  const handleViewMoreProjects = () => {
    // Navigate to the full projects page or search page
    navigate("/search-projects");
  };

  const handleProjectClick = useCallback((project) => {
    // Navigate to project details page
    navigate(`/project/${project.id}`);
  }, [navigate]);

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
              <ProjectCard 
                key={project.id} 
                project={project} 
                variant="catalog"
                onCardClick={handleProjectClick}
              />
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
