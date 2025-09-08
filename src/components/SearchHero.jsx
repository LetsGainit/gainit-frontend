import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../css/SearchHero.css";

const SearchHero = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [typewriterText, setTypewriterText] = useState("");
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [phase, setPhase] = useState("typing"); // 'typing' | 'pausing' | 'deleting'
  const [charIndex, setCharIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const examples = [
    "I want to be a Frontend Developer and I love fitness",
    "I want to be a Data Analyst and I love food",
    "I want to be a Backend Developer and I enjoy gaming",
    "I want to be a UX Designer and I like traveling",
    "I want to be a Cybersecurity Engineer and I play guitar",
  ];

  const currentExample = examples[currentExampleIndex];

  useEffect(() => {
    if (query !== "") return; // Don't animate when user is typing

    let timeoutId;

    switch (phase) {
      case "typing":
        if (charIndex < currentExample.length) {
          timeoutId = setTimeout(() => {
            setTypewriterText(currentExample.slice(0, charIndex + 1));
            setCharIndex(charIndex + 1);
          }, 28); // ~28ms per character
        } else {
          timeoutId = setTimeout(() => {
            setPhase("pausing");
          }, 900); // Pause before deleting
        }
        break;

      case "pausing":
        timeoutId = setTimeout(() => {
          setPhase("deleting");
        }, 900); // Pause duration
        break;

      case "deleting":
        if (charIndex > 0) {
          timeoutId = setTimeout(() => {
            setTypewriterText(currentExample.slice(0, charIndex - 1));
            setCharIndex(charIndex - 1);
          }, 18); // ~18ms per character (faster deletion)
        } else {
          timeoutId = setTimeout(() => {
            setPhase("typing");
            setCurrentExampleIndex((prev) => (prev + 1) % examples.length);
            setCharIndex(0);
          }, 500); // Brief pause between examples
        }
        break;
    }

    return () => clearTimeout(timeoutId);
  }, [phase, charIndex, currentExample, query, examples.length]);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || isLoading) return;

    setIsLoading(true);

    // Clear typewriter hint
    setTypewriterText("");

    // Navigate to search results page with query parameters
    const searchParams = new URLSearchParams({
      q: trimmedQuery,
      count: "12",
    });

    navigate(`/search-result?${searchParams.toString()}`);

    // Call original onSearch if provided
    if (onSearch) {
      onSearch(trimmedQuery);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="search-hero-container">
      <div className="search-hero-wrapper">
        {/* Main Search Container */}
        <div className="search-hero-input-container">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            className="search-hero-input"
            placeholder="Search for projects..."
            aria-label="Search for projects by role or interest"
            rows={3}
          />

          {/* Typewriter Overlay */}
          {query === "" && (
            <div className="search-hero-typewriter-overlay">
              <div className="search-hero-typewriter-text">
                {typewriterText}
                <span className="search-hero-caret"></span>
              </div>
            </div>
          )}

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="search-hero-button"
            aria-label="Search projects"
            disabled={isLoading}
          >
            <Search size={24} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchHero;
