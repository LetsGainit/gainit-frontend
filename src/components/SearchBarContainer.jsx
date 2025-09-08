import { useRef } from "react";
import { Search, Filter } from "lucide-react";
import "../css/SearchProjects.css";

function SearchBarContainer({
  value,
  onChange,
  onSearch,
  onOpenFilters,
  placeholder = "Search projects, technologies...",
  disabled = false,
  isLoading = false,
}) {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearch && onSearch();
    }
  };

  return (
    <div className="page-header">
      <div className="search-section">
        <h1 className="page-title left-align">Projects</h1>
        <div className="search-row">
          <div className="search-container">
            <input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange && onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="search-input pill"
              disabled={disabled}
            />
            <button
              className="search-icon-btn"
              onClick={() => onSearch && onSearch()}
              aria-label="Search projects"
              disabled={disabled}
            >
              <span className="search-icon-svg-wrapper">
                <Search size={20} strokeWidth={2.5} color="#fff" />
              </span>
            </button>
          </div>
          <button className="filter-btn" aria-label="Filter projects" onClick={() => onOpenFilters && onOpenFilters()} disabled={disabled}>
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>
        {isLoading && (
          <div className="left-align" style={{ marginTop: "8px", color: "#666" }}>Searching...</div>
        )}
      </div>
    </div>
  );
}

export default SearchBarContainer;


