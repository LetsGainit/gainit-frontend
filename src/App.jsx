import "./css/App.css";
import ProjectCard from "./components/ProjectCard";
import Home from "./pages/Home/Home";
import SearchProjects from "./pages/SearchProjects/SearchProjects";
import HomePage from "./pages/HomePage/HomePage";
import ProjectPage from "./pages/ProjectPage/ProjectPage";
import {
  Routes,
  Route,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import HomeNavBar from "./components/HomeNavBar";
import About from "./pages/About/About";
import PlatformNavBar from "./components/PlatformNavBar";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import Login from "./pages/Login";
import { useLayoutEffect, useEffect, useRef } from "react";

// Custom hook to scroll to top on route changes
function useScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isInitialMount = useRef(true);

  // Disable browser scroll restoration on mount and handle pageshow events
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Disable browser scroll restoration
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      // Handle pageshow event for bfcache (Back/Forward cache)
      const handlePageShow = (event) => {
        if (event.persisted) {
          // Page was restored from bfcache, force scroll reset
          resetAllScrollContainers();
        }
      };

      window.addEventListener("pageshow", handlePageShow);

      // Cleanup
      return () => {
        window.removeEventListener("pageshow", handlePageShow);
      };
    }
  }, []);

  // Function to reset all scroll containers
  const resetAllScrollContainers = () => {
    // Reset window scroll
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    } catch {
      window.scrollTo(0, 0);
    }

    // Reset document.documentElement scroll (for some mobile browsers)
    try {
      document.documentElement.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    } catch {
      document.documentElement.scrollTo(0, 0);
    }

    // Reset document.body scroll (for some mobile browsers)
    try {
      document.body.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    } catch {
      document.body.scrollTo(0, 0);
    }

    // Reset the main content wrapper (canonical scroll container)
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      try {
        mainContent.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant",
        });
      } catch {
        mainContent.scrollTo(0, 0);
      }
    }

    // Reset any other scrollable containers with overflow: auto/scroll
    const scrollableContainers = document.querySelectorAll(
      '[class*="overflow"], .search-hero-input, [style*="overflow"], [data-scroll-container]'
    );
    scrollableContainers.forEach((container) => {
      try {
        container.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant",
        });
      } catch {
        container.scrollTo(0, 0);
      }
    });

    // iOS Safari specific handling - reset scroll position on body and html
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      document.body.scrollLeft = 0;
      document.documentElement.scrollLeft = 0;
    }

    // Additional mobile browser handling
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      // Force scroll reset for mobile browsers
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Use useLayoutEffect to prevent visible flicker
  useLayoutEffect(() => {
    // Skip scroll reset if there's a hash fragment (anchor links)
    if (location.hash) {
      return;
    }

    // Skip on initial mount to avoid interfering with initial page load
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Force scroll to top on every route change and navigation type
    resetAllScrollContainers();

    // Use double RAF fallback to beat POP state restoration on Safari/iOS
    requestAnimationFrame(() => {
      resetAllScrollContainers();

      // Second RAF to ensure we win against late autofocus and browser restoration
      requestAnimationFrame(() => {
        resetAllScrollContainers();
      });
    });
  }, [location.pathname, location.search, navigationType]);

  // Handle initial page load scroll reset
  useEffect(() => {
    if (isInitialMount.current) {
      // Reset scroll on initial page load
      resetAllScrollContainers();
      isInitialMount.current = false;
    }
  }, []);

  // Additional effect to handle direct URL access and page refresh
  useEffect(() => {
    const handleLoad = () => {
      // Ensure scroll is reset on page load/refresh
      setTimeout(() => {
        resetAllScrollContainers();
      }, 0);
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", handleLoad);
    } else {
      handleLoad();
    }

    return () => {
      document.removeEventListener("DOMContentLoaded", handleLoad);
    };
  }, []);
}

// Component to handle scroll to top
function ScrollToTop() {
  useScrollToTop();
  return null;
}

function App() {
  return (
    <div>
      <PlatformNavBar />

      {/* Scroll to top component */}
      <ScrollToTop />

      <main className="main-content" data-scroll-container>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/search-projects" element={<SearchProjects />} />
          <Route path="/home-page" element={<HomePage />} />
          <Route path="/project/:id" element={<ProjectPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
