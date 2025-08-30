import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingIllustration from "./LoadingIllustration";

const RoleCheck = ({ children }) => {
  const { userInfo, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip role check if not authenticated or still loading
    if (!isAuthenticated || loading) return;

    // Skip role check if already on role selection page or auth callback
    if (
      location.pathname === "/choose-role" ||
      location.pathname === "/auth-callback"
    )
      return;

    // If user is authenticated but has no role, redirect to role selection
    if (userInfo && !userInfo.role) {
      console.log("[RoleCheck] User has no role, redirecting to /choose-role");
      navigate("/choose-role", { replace: true });
      return;
    }

    // If user has a role but is on role selection page, redirect to their profile
    if (userInfo && userInfo.role && location.pathname === "/choose-role") {
      console.log("[RoleCheck] User has role, redirecting to profile");
      navigate(`/profile/${userInfo.userId}`, { replace: true });
      return;
    }
  }, [userInfo, loading, isAuthenticated, navigate, location.pathname]);

  // Show loading state while checking role or if user info is not yet loaded
  if (loading || (isAuthenticated && !userInfo)) {
    return <LoadingIllustration type="initial" />;
  }

  return children;
};

export default RoleCheck;
