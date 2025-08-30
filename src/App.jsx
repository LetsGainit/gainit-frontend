import "./css/App.css";
import SearchProjects from "./pages/SearchProjects/SearchProjects";
import HomePage from "./pages/HomePage/HomePage";
import ProjectPage from "./pages/ProjectPage/ProjectPage";
import { Routes, Route } from "react-router-dom";
import About from "./pages/About/About";
import PlatformNavBar from "./components/PlatformNavBar";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import ChooseRole from "./pages/ChooseRole/ChooseRole";
import Login from "./pages/Login";
import AuthCallback from "./auth/AuthCallback";
import ScrollToTop from "./components/ScrollToTop";
import RoleCheck from "./components/RoleCheck";

function App() {
  return (
    <div>
      <PlatformNavBar />
      <ScrollToTop />

      <main className="main-content">
        <RoleCheck>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/search-projects" element={<SearchProjects />} />
            <Route path="/home-page" element={<HomePage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/profile/gainer/:id" element={<ProfilePage />} />
            <Route path="/profile/mentor/:id" element={<ProfilePage />} />
            <Route path="/profile/nonprofit/:id" element={<ProfilePage />} />
            <Route path="/choose-role" element={<ChooseRole />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
          </Routes>
        </RoleCheck>
      </main>
    </div>
  );
}

export default App;
