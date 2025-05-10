import "./css/App.css";
import ProjectCard from "./components/ProjectCard";
import Home from "./pages/Home/Home";
import SearchProjects from "./pages/SearchProjects/SearchProjects";
import LearningProjects from "./pages/LearningProjects/LearningProjects";
import { Routes, Route, useLocation } from "react-router-dom";
import HomeNavBar from "./components/HomeNavBar";
import About from "./pages/About/About";
import PlatformNavBar from "./components/PlatformNavBar";

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div>
      {isHomePage ? <HomeNavBar /> : <PlatformNavBar />}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/search-projects" element={<SearchProjects />} />
          <Route path="/learning-projects" element={<LearningProjects />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
