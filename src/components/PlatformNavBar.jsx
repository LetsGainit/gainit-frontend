import { Link } from "react-router-dom";
import { useState } from "react";
import { Bell, CircleUserRound, ChevronDown } from "lucide-react";
import "../css/PlatformNavBar.css";

function PlatformNavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

  return (
    <nav className="platform-NavBar">
      {/* Left Section - Logo */}
      <div className="platform-brand">
        <Link to="/">Gainit</Link>
      </div>

      {/* Center Section - Navigation */}
      <div className="platform-nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        <div className="dropdown">
          <button 
            className="nav-link dropdown-trigger"
            onClick={() => setIsProjectsOpen(!isProjectsOpen)}
            onBlur={() => setTimeout(() => setIsProjectsOpen(false), 200)}
          >
            Projects <ChevronDown size={16} />
          </button>
          {isProjectsOpen && (
            <div className="dropdown-menu">
              <Link to="/search-projects" className="dropdown-item">Find Projects</Link>
              <Link to="/my-projects" className="dropdown-item">My Projects</Link>
            </div>
          )}
        </div>
        <Link to="/forum" className="nav-link">Forum</Link>
      </div>

      {/* Right Section - User Actions */}
      <div className="platform-controls">
        <button className="icon-button" aria-label="Notifications">
          <Bell size={20} />
        </button>
        <div className="vertical-separator"></div>
        <div className="user-profile">
          <button className="avatar-button" aria-label="User Profile">
            <CircleUserRound size={20} />
          </button>
          <span className="username">Gainer</span>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="mobile-menu-button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-nav-link">Home</Link>
          <Link to="/about" className="mobile-nav-link">About</Link>
          <Link to="/search-projects" className="mobile-nav-link">Find Projects</Link>
          <Link to="/my-projects" className="mobile-nav-link">My Projects</Link>
          <Link to="/forum" className="mobile-nav-link">Forum</Link>
        </div>
      )}
    </nav>
  );
}

export default PlatformNavBar;
