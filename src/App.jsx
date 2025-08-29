import "./css/App.css";
import SearchProjects from "./pages/SearchProjects/SearchProjects";
import HomePage from "./pages/HomePage/HomePage";
import ProjectPage from "./pages/ProjectPage/ProjectPage";
import { Routes, Route } from "react-router-dom";
import About from "./pages/About/About";
import PlatformNavBar from "./components/PlatformNavBar";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import Login from "./pages/Login";
import { useMsal } from "@azure/msal-react";
import AuthCallback from "./auth/AuthCallback";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const { accounts } = useMsal();

  return (
    <div>
      <PlatformNavBar />
      <ScrollToTop />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/search-projects" element={<SearchProjects />} />
          <Route path="/home-page" element={<HomePage />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
