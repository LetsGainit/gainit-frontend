import React from "react";
import Sidebar from "../Sidebar";
import "./WorkAreaLayout.css";

const WorkAreaLayout = ({ children, activeView, setActiveView }) => {
  return (
    <div className="work-area-layout">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="work-area-main">
        {children}
      </main>
    </div>
  );
};

export default WorkAreaLayout;
