import "./css/App.css";
import ProjectCard from "./components/ProjectCard";
import Home from "./pages/Home/Home";
import SearchProjects from "./pages/SearchProjects/SearchProjects";
import LearningProjects from "./pages/LearningProjects/LearningProjects";
import ProjectPage from "./pages/ProjectPage/ProjectPage";
import { Routes, Route, useLocation } from "react-router-dom";
import HomeNavBar from "./components/HomeNavBar";
import About from "./pages/About/About";
import PlatformNavBar from "./components/PlatformNavBar";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import Login from "./pages/Login";

function App() {
  const location = useLocation();

  return (
    <div>
      <PlatformNavBar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<LearningProjects />} />
          <Route path="/about" element={<About />} />
          <Route path="/search-projects" element={<SearchProjects />} />
          <Route path="/learning-projects" element={<LearningProjects />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;