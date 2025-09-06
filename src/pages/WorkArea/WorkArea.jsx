import React, { useState } from "react";
import Footer from "../../components/Footer";
import WorkAreaLayout from "../../components/layout/WorkAreaLayout";
import MyProjects from "./MyProjects";
import { useAuth } from "../../hooks/useAuth";
import "./WorkArea.css";

const WorkArea = () => {
  const [activeView, setActiveView] = useState("my-projects");

  // This will be controlled by the sidebar navigation
  // Default to My Projects
  const renderContent = () => {
    switch (activeView) {
      case "my-projects":
      default:
        return <MyProjects />;
    }
  };

  return (
    <>
      <div className="work-area-content">
        <WorkAreaLayout activeView={activeView} setActiveView={setActiveView}>
          {renderContent()}
        </WorkAreaLayout>
      </div>
      
      {/* Footer at bottom of full page layout - outside sidebar layout */}
      <Footer />
    </>
  );
};

export default WorkArea;
