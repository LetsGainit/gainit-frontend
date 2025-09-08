import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useNavigationType } from "react-router-dom";
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
  const navigationType = useNavigationType();

  // Helpers for session cache
  const makeCacheKey = (q, count) => `sr-cache::q=${(q||"").trim()}::count=${count||6}`;
  const readCache = (q, count) => {
    try {
      const key = makeCacheKey(q, count);
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_e) { return null; }
  };
  const writeCache = (q, count, payload) => {
    try {
      const key = makeCacheKey(q, count);
      sessionStorage.setItem(key, JSON.stringify(payload));
    } catch (_e) {}
  };

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
      const count = 6;
      // Check cache first
      const cached = readCache(trimmed, count);
      if (cached && Array.isArray(cached.items)) {
        setProjects(cached.items);
        setIsLoading(false);
        // Restore scroll if present
        if (typeof cached.scrollY === 'number') {
          setTimeout(() => window.scrollTo(0, cached.scrollY), 0);
        }
        // Update URL without refetch
        const next = new URL(window.location.href);
        next.searchParams.set("q", trimmed);
        next.searchParams.set("count", String(count));
        window.history.replaceState({}, "", next.toString());
        return;
      }

      const response = await publicApi.get(`/projects/search/vector`, {
        params: { query: trimmed, count },
        headers: { "Content-Type": "application/json" },
      });

      const data = response.data || {};
      const items = Array.isArray(data.projects) ? data.projects : [];
      setProjects(items);
      // Persist to cache
      writeCache(trimmed, count, { items, total: items.length, scrollY: 0 });

      const next = new URL(window.location.href);
      next.searchParams.set("q", trimmed);
      next.searchParams.set("count", String(count));
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
    // Save current results and scroll position into cache for the active query
    const trimmed = (searchTerm || "").trim();
    const count = 6;
    try {
      const existing = readCache(trimmed, count) || { items: projects, total: projects.length };
      writeCache(trimmed, count, { ...existing, items: projects, total: projects.length, scrollY: window.scrollY });
    } catch (_e) {}

    const rawStatus = project?.projectStatus || project?.status || "";
    const normalized = String(rawStatus).toLowerCase();
    const isActive = normalized === "pending" || normalized === "inprogress" || normalized === "in_progress";
    // Navigate to the project page (push to history)
    navigate(`/project/${projectId}`);
  }, [navigate, projects, searchTerm]);

  // On mount: if coming back via browser back/forward (POP), hydrate from cache
  useEffect(() => {
    const trimmed = (initialQuery || "").trim();
    const count = 6;
    if (!trimmed) return;

    if (navigationType === 'POP') {
      const cached = readCache(trimmed, count);
      if (cached && Array.isArray(cached.items)) {
        setProjects(cached.items);
        setError("");
        setIsLoading(false);
        if (typeof cached.scrollY === 'number') {
          setTimeout(() => window.scrollTo(0, cached.scrollY), 0);
        }
        return;
      }
    }

    if (!hasAutoSearched.current && trimmed) {
      hasAutoSearched.current = true;
      handleSearch();
    }
  }, [initialQuery, handleSearch, navigationType]);

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


