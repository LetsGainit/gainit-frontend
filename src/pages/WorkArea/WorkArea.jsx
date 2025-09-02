import React, { useState } from "react";
import Footer from "../../components/Footer";
import WorkAreaLayout from "../../components/layout/WorkAreaLayout";
import MyProjects from "./MyProjects";
import "./WorkArea.css";

const WorkArea = () => {
  const [activeView, setActiveView] = useState("dashboard");

  // This will be controlled by the sidebar navigation
  // For now, we'll show the dashboard by default
  const renderContent = () => {
    switch (activeView) {
      case "my-projects":
        return <MyProjects />;
      case "dashboard":
      default:
        return (
          <div className="work-area-page">
            {/* Welcome Header */}
            <div className="work-area-header">
              {/* TODO: Replace "John" with user's actual first name from user context */}
              <h1 className="welcome-title">Welcome back, John</h1>
              <p className="welcome-subtitle">
                Ready to make progress on your projects today?
              </p>
            </div>

            {/* Actions/Filters Bar Placeholder */}
            <div className="actions-bar-placeholder">
              {/* Placeholder for future actions/filters */}
            </div>

            {/* Main Grid Container Placeholder */}
            <div className="main-grid-placeholder">
              {/* Placeholder for Active/Upcoming/Recent cards */}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <WorkAreaLayout activeView={activeView} setActiveView={setActiveView}>
        {renderContent()}
      </WorkAreaLayout>
      
      {/* Footer at bottom of full page layout */}
      <Footer />
    </>
  );
};

export default WorkArea;
