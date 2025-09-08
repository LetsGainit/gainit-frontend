import "./css/App.css";
import "./css/ErrorBoundary.css";
import SearchProjects from "./pages/SearchProjects/SearchProjects";
import SearchResult from "./pages/SearchResult/SearchResult";
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
import WorkArea from "./pages/WorkArea/WorkArea";
import ProjectWork from "./pages/WorkArea/ProjectWork";
import TaskDetails from "./pages/WorkArea/ProjectWork/TaskDetails";
import TempTasksScreen from "./pages/WorkArea/TempTasksScreen";
import AIInsight from "./pages/AIInsight/AIInsight";
import GainerProfilePage from "./pages/GainerProfilePage/GainerProfilePage";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <div>
        <PlatformNavBar />
        <ScrollToTop />

        <main className="main-content">
          <Routes>
          {/* Public routes - no authentication required */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/search-projects" element={<SearchProjects />} />
          <Route path="/search-result" element={<SearchResult />} />
          <Route path="/home-page" element={<HomePage />} />
          <Route path="/work" element={<WorkArea />} />
          <Route path="/ai-insight" element={<AIInsight />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/profile/gainer/:id" element={<ProfilePage />} />
          <Route path="/profile/mentor/:id" element={<ProfilePage />} />
          <Route path="/profile/nonprofit/:id" element={<ProfilePage />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          <Route
            path="/onboarding/gainer-profile"
            element={<GainerProfilePage />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/auth-callback" element={<AuthCallback />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          
          {/* Protected routes - wrapped with RoleCheck for authentication and role-based routing */}
          <Route path="/*" element={
            <RoleCheck>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<About />} />
                <Route path="/search-projects" element={<SearchProjects />} />
                <Route path="/search-result" element={<SearchResult />} />
                <Route path="/home-page" element={<HomePage />} />
                <Route path="/work/projects/:projectId" element={<ProjectWork />} />
                <Route path="/work/projects/:projectId/tasks/:taskId" element={<TaskDetails />} />
                <Route path="/work/tmp/:projectId" element={<TempTasksScreen />} />
                <Route path="/project/:id" element={<ProjectPage />} />
                <Route path="/profile/:id" element={<ProfilePage />} />
                <Route path="/profile/gainer/:id" element={<ProfilePage />} />
                <Route path="/profile/mentor/:id" element={<ProfilePage />} />
                <Route path="/profile/nonprofit/:id" element={<ProfilePage />} />
                <Route
                  path="/onboarding/gainer-profile"
                  element={<GainerProfilePage />}
                />
              </Routes>
            </RoleCheck>
          } />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
