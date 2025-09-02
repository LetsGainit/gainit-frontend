import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Bell, CircleUserRound, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { apiScopes } from "../auth/msalConfig";
import { useAuth } from "../hooks/useAuth";
import {
  buildProfileUrl,
  isValidRole,
  getDisplayNameForRole,
} from "../utils/userUtils";
import Toast from "./Toast";
import "../css/PlatformNavBar.css";

function PlatformNavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("error");

  const navigate = useNavigate();
  const { instance, accounts } = useMsal();
  const { isAuthenticated, userInfo, loading, error, signOut } = useAuth();
  const location = useLocation();

  // Skip auth-related API calls on choose-role route
  const isChooseRoleRoute = location.pathname === "/choose-role";

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProjectsOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Handle clicks outside profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest(".user-profile .dropdown")) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  // Handle keyboard navigation for profile dropdown
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isProfileOpen) return;

      switch (event.key) {
        case "Escape":
          setIsProfileOpen(false);
          break;
        case "Enter":
        case " ":
          // Prevent default to avoid double-triggering
          event.preventDefault();
          break;
      }
    };

    if (isProfileOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileOpen]);

  // Show error toast if there's an authentication error
  useEffect(() => {
    if (error && isAuthenticated && !isChooseRoleRoute) {
      setToastMessage(error);
      setToastType("error");
      setShowToast(true);
    }
  }, [error, isAuthenticated, isChooseRoleRoute]);

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      handleUserClick();
      return;
    }
    setIsProfileOpen(!isProfileOpen);
  };

  const handleUserClick = async () => {
    if (!isAuthenticated) {
      try {
        // Redirect to Azure AD B2C sign-in/sign-up flow
        await instance.loginRedirect({
          scopes: ["openid", "profile", "offline_access", ...apiScopes],
          redirectStartPage: "/",
        });
      } catch (error) {
        console.error("Login redirect failed:", error);
        setToastMessage("Failed to initiate login. Please try again.");
        setToastType("error");
        setShowToast(true);
      }
      return;
    }

    // User is authenticated, navigate to profile based on role
    try {
      if (!userInfo || !userInfo.role) {
        setToastMessage(
          "User role information not available. Please try refreshing the page."
        );
        setToastType("warning");
        setShowToast(true);
        return;
      }

      if (!isValidRole(userInfo.role)) {
        setToastMessage(
          `Unknown user role: ${userInfo.role}. Please contact support.`
        );
        setToastType("error");
        setShowToast(true);
        // Redirect to home page for unknown roles
        navigate("/");
        return;
      }

      // Build profile URL based on role
      const profileUrl = buildProfileUrl(userInfo.role, userInfo.userId);
      navigate(profileUrl);
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Navigation to profile failed:", error);
      setToastMessage("Failed to navigate to profile. Please try again.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut();
      setIsProfileOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setToastMessage("Failed to log out. Please try again.");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleToastClose = () => {
    setShowToast(false);
  };

  // Get display name for user
  const getDisplayName = () => {
    if (isChooseRoleRoute) return "Gainer";
    if (!isAuthenticated) return "Gainer";
    if (loading) return "Loading...";
    if (userInfo?.name) return userInfo.name;
    if (accounts.length > 0 && accounts[0].name) return accounts[0].name;
    return getDisplayNameForRole(userInfo?.role) || "User";
  };

  return (
    <>
      <nav className="platform-NavBar">
        {/* Left Section - Logo */}
        <div className="platform-brand">
          <Link to="/">
            <img src="/Gainit_logo.svg" alt="Gainit logo" className="logo" />
          </Link>
        </div>

        {/* Center Section - Navigation */}
        <div className="platform-nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/work" className="nav-link">
            Work Area
          </Link>
          <Link to="/about" className="nav-link">
            About
          </Link>
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
                <Link to="/search-projects" className="dropdown-item">
                  Find Projects
                </Link>
                <Link to="/my-projects" className="dropdown-item">
                  My Projects
                </Link>
              </div>
            )}
          </div>
          <Link to="/Learn" className="nav-link">
            Learn
          </Link>
        </div>

        {/* Right Section - User Actions */}
        <div className="platform-controls">
          <button className="icon-button" aria-label="Notifications">
            <Bell size={20} />
          </button>
          <div className="vertical-separator"></div>
          <div className="user-profile">
            <div className={`dropdown ${isProfileOpen ? "open" : ""}`}>
              <button
                className="avatar-button"
                aria-label="User Profile"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
                onClick={handleProfileClick}
                onBlur={() => setTimeout(() => setIsProfileOpen(false), 200)}
                disabled={loading || isChooseRoleRoute}
              >
                <CircleUserRound size={20} />
                <ChevronDown size={16} className="profile-chevron" />
              </button>
              {isProfileOpen && isAuthenticated && !isChooseRoleRoute && (
                <div
                  className="dropdown-menu profile-dropdown"
                  role="menu"
                  aria-label="User profile options"
                >
                  <div className="dropdown-item user-info" role="presentation">
                    <span className="user-name">{getDisplayName()}</span>
                    <span className="user-role">
                      {getDisplayNameForRole(userInfo?.role)}
                    </span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item"
                    onClick={handleUserClick}
                    role="menuitem"
                  >
                    View Profile
                  </button>
                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogOut}
                    role="menuitem"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
            <span className="username">{getDisplayName()}</span>
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
            <Link
              to="/"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/work"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Work Area
            </Link>
            <Link
              to="/about"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              to="/search-projects"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Projects
            </Link>
            <Link
              to="/my-projects"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              My Projects
            </Link>
            <Link
              to="/Learn"
              className="mobile-nav-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Learn
            </Link>
            {isAuthenticated && !isChooseRoleRoute && (
              <>
                <div className="mobile-divider"></div>
                <div className="mobile-user-info">
                  <div className="mobile-user-details">
                    <CircleUserRound size={20} />
                    <div className="mobile-user-text">
                      <span className="mobile-user-name">{getDisplayName()}</span>
                      <span className="mobile-user-role">
                        {getDisplayNameForRole(userInfo?.role)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="mobile-nav-link"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleUserClick();
                  }}
                >
                  View Profile
                </button>
                <button
                  className="mobile-nav-link logout-mobile"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogOut();
                  }}
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Toast Notifications */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={handleToastClose}
          duration={5000}
        />
      )}
    </>
  );
}

export default PlatformNavBar;
