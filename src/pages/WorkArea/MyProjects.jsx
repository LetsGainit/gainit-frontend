import React, { useState } from "react";
import { Clock, CheckCircle, Users, Crown } from "lucide-react";
import "./MyProjects.css";

const MyProjects = () => {
  const [activeTab, setActiveTab] = useState("Active");

  const tabs = [
    {
      id: "Active",
      label: "Active",
      icon: Clock,
    },
    {
      id: "Complited",
      label: "Complited",
      icon: CheckCircle,
    },
    {
      id: "Requested",
      label: "Requested",
      icon: Users,
    },
    {
      id: "Owend",
      label: "Owend",
      icon: Crown,
    },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const handleKeyDown = (event, tabId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveTab(tabId);
    }
  };

  const getContentPlaceholder = () => {
    switch (activeTab) {
      case "Active":
        return "Active projects (placeholder)";
      case "Complited":
        return "Completed projects (placeholder)";
      case "Requested":
        return "Requested projects (placeholder)";
      case "Owend":
        return "Owned projects (placeholder)";
      default:
        return "Projects (placeholder)";
    }
  };

  return (
    <div className="my-projects-page">
      {/* Page Header */}
      <div className="my-projects-header">
        <h1 className="page-title">My Projects</h1>
        <p className="page-subtitle">
          Manage your active projects and track your contributions
        </p>
      </div>

      {/* Tabs Row */}
      <div className="tabs-container">
        <div
          className="tabs-row"
          role="tablist"
          aria-label="Project categories"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                className={`tab-button ${isActive ? "active" : ""}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => handleTabClick(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id)}
                tabIndex={isActive ? 0 : -1}
              >
                <Icon size={16} className="tab-icon" />
                <span className="tab-label">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Region */}
      <div className="content-region">
        <div className="content-placeholder">
          <h2 className="placeholder-title">{getContentPlaceholder()}</h2>
          <p className="placeholder-description">
            This area will display your {activeTab.toLowerCase()} projects when implemented.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyProjects;
