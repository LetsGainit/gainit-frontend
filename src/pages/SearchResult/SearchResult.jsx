import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchBarContainer from "../../components/SearchBarContainer";
import LoadingIllustration from "../../components/LoadingIllustration";
import ProjectCard from "../../components/project/ProjectCard";
import publicApi from "../../services/publicApi";

function SearchResult() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialQuery = params.get("q") || params.get("query") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const hasAutoSearched = useRef(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(async () => {
    const trimmed = (searchTerm || "").trim();
    if (!trimmed) {
      setError("Please enter a search term");
      setProjects([]);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await publicApi.get(`/projects/search/vector`, {
        params: { query: trimmed, count: 6 },
        headers: { "Content-Type": "application/json" },
      });

      const data = response.data || {};
      const items = Array.isArray(data.projects) ? data.projects : [];
      setProjects(items);

      const next = new URL(window.location.href);
      next.searchParams.set("q", trimmed);
      next.searchParams.set("count", "6");
      window.history.replaceState({}, "", next.toString());
    } catch (e) {
      const message = e?.response?.data?.message || e?.message || "Unknown error";
      setError(`Search Error: ${message}`);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  const handleOpenFilters = useCallback(() => {
    console.log("Open filters clicked");
  }, []);

  const handleProjectClick = useCallback((project) => {
    const projectId = project?.id || project?.projectId;
    if (!projectId) return;

    const rawStatus = project?.projectStatus || project?.status || "";
    const normalized = String(rawStatus).toLowerCase();
    const isActive = normalized === "pending" || normalized === "inprogress" || normalized === "in_progress";

    // Replace current history entry so URL doesn't include /search-result
    navigate(`/project/${projectId}`, { replace: true });
  }, [navigate]);

  // Auto-run search on initial load if there is a query param
  useEffect(() => {
    const trimmed = (initialQuery || "").trim();
    if (!hasAutoSearched.current && trimmed) {
      hasAutoSearched.current = true;
      handleSearch();
    }
  }, [initialQuery, handleSearch]);

  return (
    <div className="search-projects-page">
      <SearchBarContainer
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
        onOpenFilters={handleOpenFilters}
        placeholder="Search projects, technologies..."
        disabled={isLoading}
        isLoading={isLoading}
      />
      <div className="projects-section">
        <div className="page-container">
          {isLoading && (
            <LoadingIllustration type="search" />
          )}
          {!isLoading && error && (
            <div className="no-results" style={{ color: "#b3261e", marginBottom: "12px" }}>
              {error}
            </div>
          )}

          {!error && !isLoading && projects.length === 0 && (
            <div className="no-results">
              <p>No projects found</p>
              <p style={{ color: "#666", marginTop: "8px" }}>
                Try refining your keywords or use different terms.
              </p>
            </div>
          )}

          {!isLoading && projects.length > 0 && (
            <div className="projects-grid">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id || project.projectId}
                  project={project}
                  variant="catalog"
                  onCardClick={handleProjectClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchResult;


