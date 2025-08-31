// src/AuthCallback.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { getUserInfo } from "./auth";

export default function AuthCallback() {
  const { inProgress, accounts } = useMsal();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for MSAL to finish processing redirect
    if (inProgress !== InteractionStatus.None) return;

    const go = async () => {
      try {
        if (accounts.length > 0) {
          // Check if ensure has already handled navigation for new users
          const accountId = accounts[0]?.homeAccountId ?? "unknown";
          const ensureCompletedKey = `ensureCompleted:${accountId}`;
          const redirectDecisionKey = `redirectDecision:${accountId}`;
          
          // If ensure completed and decided to redirect to /choose-role, 
          // the ensure handler should have already navigated there
          if (sessionStorage.getItem(ensureCompletedKey)) {
            const redirectDecision = sessionStorage.getItem(redirectDecisionKey);
            
            if (redirectDecision === "/choose-role") {
              console.info("[AUTH] AuthCallback: ensure already redirected to /choose-role");
              // Double-check we're not already on /choose-role
              if (window.location.pathname !== "/choose-role") {
                navigate("/choose-role", { replace: true });
              }
              return;
            } else if (redirectDecision === "start-page") {
              console.info("[AUTH] AuthCallback: ensure decided start-page");
              // User has a role, redirect to original page or home
              const start = sessionStorage.getItem("msal.redirectStartPage") || "/";
              sessionStorage.removeItem("msal.redirectStartPage");
              console.log("[AUTH] User has role, redirecting to:", start);
              navigate(start, { replace: true });
              return;
            }
          }
          
          // If ensure hasn't completed yet, wait a bit and check again
          if (!sessionStorage.getItem(ensureCompletedKey)) {
            console.info("[AUTH] AuthCallback: waiting for ensure to complete...");
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Check again after waiting
            if (sessionStorage.getItem(ensureCompletedKey)) {
              const redirectDecision = sessionStorage.getItem(redirectDecisionKey);
              if (redirectDecision === "/choose-role") {
                console.info("[AUTH] AuthCallback: ensure completed, redirecting to /choose-role");
                navigate("/choose-role", { replace: true });
                return;
              } else if (redirectDecision === "start-page") {
                console.info("[AUTH] AuthCallback: ensure completed, redirecting to start page");
                const start = sessionStorage.getItem("msal.redirectStartPage") || "/";
                sessionStorage.removeItem("msal.redirectStartPage");
                navigate(start, { replace: true });
                return;
              }
            }
          }
          
          // Fallback: if ensure didn't complete or set a decision, check user info directly
          console.warn("[AUTH] AuthCallback: no ensure decision, falling back to direct check");
          try {
            const userInfo = await getUserInfo();
            
            // If user has no role, redirect to role selection
            if (!userInfo.role) {
              console.info("[AUTH] AuthCallback: role =", userInfo.role);
              console.info("[AUTH] AuthCallback: navigating to /choose-role");
              navigate("/choose-role", { replace: true });
              return;
            }
            
            // User has a role, redirect to original page or home
            const start = sessionStorage.getItem("msal.redirectStartPage") || "/";
            sessionStorage.removeItem("msal.redirectStartPage");
            console.log("[AUTH] User has role, redirecting to:", start);
            navigate(start, { replace: true });
          } catch (userInfoError) {
            console.warn("[AUTH] Failed to get user info, redirecting to role selection:", userInfoError);
            // Fallback to role selection if user info fetch fails
            navigate("/choose-role", { replace: true });
          }
        } else {
          setError("No account found after login redirect.");
          navigate("/", { replace: true });
        }
      } catch (e: any) {
        setError(e.message ?? String(e));
      }
    };

    void go();
  }, [inProgress, accounts.length, navigate]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Signing you in…</h2>
      {error && (
        <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{error}</pre>
      )}
    </div>
  );
}
