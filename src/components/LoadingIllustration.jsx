import React from "react";
import "../css/LoadingIllustration.css";

const LoadingIllustration = ({ type = "initial" }) => {
  return (
    <div
      className="loading-illustration"
      role="status"
      aria-live="polite"
      aria-label="Loading projects"
    >
      <div className="illustration-container">
        <div className="glow-background"></div>
        <svg
          className="search-illustration"
          viewBox="0 0 120 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background circle */}
          <circle cx="60" cy="40" r="35" fill="currentColor" opacity="0.1" />

          {/* Magnifying glass */}
          <circle
            cx="45"
            cy="35"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="52"
            y1="42"
            x2="65"
            y2="55"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Project cards */}
          <rect
            x="70"
            y="25"
            width="25"
            height="15"
            rx="3"
            fill="currentColor"
            opacity="0.3"
          />
          <rect
            x="75"
            y="45"
            width="20"
            height="12"
            rx="3"
            fill="currentColor"
            opacity="0.2"
          />
          <rect
            x="80"
            y="60"
            width="15"
            height="10"
            rx="3"
            fill="currentColor"
            opacity="0.1"
          />
        </svg>
      </div>

      <div className="loading-content">
        <h2 className="loading-headline">
          {type === "initial" ? "Finding projects for you…" : "Searching…"}
        </h2>
        {type === "initial" && (
          <p className="loading-subtext">This can take a few seconds.</p>
        )}
        <div className="shimmer-line"></div>
      </div>
    </div>
  );
};

export default LoadingIllustration;
