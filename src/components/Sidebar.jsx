import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, FolderOpen, BookOpen, Briefcase } from "lucide-react";
import "./Sidebar.css";

const Sidebar = ({ activeView, setActiveView }) => {
  const location = useLocation();

  const navItems = [
    {
      id: "dashboard",
      path: "/work",
      label: "Dashboard",
      icon: Briefcase,
    },
    {
      id: "my-projects",
      path: "/work",
      label: "My projects",
      icon: FolderOpen,
    },
    {
      id: "browse-projects",
      path: "/search-projects",
      label: "Browse Projects",
      icon: Search,
    },
    {
      id: "analytics",
      path: "/analytics",
      label: "Analytics",
      icon: BookOpen,
    },
  ];

  const handleNavClick = (item) => {
    if (item.id === "my-projects" || item.id === "dashboard") {
      // Handle internal Work Area navigation
      setActiveView(item.id);
    } else {
      // Handle external navigation
      window.location.href = item.path;
    }
  };

  const isActive = (item) => {
    if (item.id === "my-projects" || item.id === "dashboard") {
      return activeView === item.id;
    }
    if (item.path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            
            return (
              <li key={item.id} className="nav-item">
                {item.id === "my-projects" || item.id === "dashboard" ? (
                  <button
                    className={`nav-link ${active ? "active" : ""}`}
                    onClick={() => handleNavClick(item)}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`nav-link ${active ? "active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={20} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
