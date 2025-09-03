import React, { useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingIllustration from "./LoadingIllustration";

const RoleCheck = ({ children }) => {
  const { userInfo, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show loading state while checking auth or user info
  if (loading || (isAuthenticated && !userInfo)) {
    return <LoadingIllustration type="initial" />;
  }

  // User not authenticated - allow public pages, block protected ones
  if (!isAuthenticated) {
    // Allow access to public routes like "/" and "/login"
    // Block access to protected routes (this will be handled by the route structure)
    return children;
  }

  // User is authenticated - apply role-based routing logic
  if (location.pathname === "/choose-role") {
    if (userInfo?.role) {
      // User has role but is on choose-role page → redirect to home
      console.log("[RoleCheck] User has role, redirecting to home from /choose-role");
      return <Navigate to="/" replace />;
    } else {
      // User has no role and is on choose-role page → stay here
      return children;
    }
  }

  // For any protected route: if user has no role, redirect to choose-role
  if (!userInfo?.role) {
    console.log("[RoleCheck] User has no role, redirecting to /choose-role");
    return <Navigate to="/choose-role" replace />;
  }

  // User is authenticated and has role → allow access to protected routes
  return children;
};

export default RoleCheck;
