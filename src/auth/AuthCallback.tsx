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
          // Check if ensure has completed and get routing decision
          const accountId = accounts[0]?.homeAccountId ?? "unknown";
          const ensureCompletedKey = `ensureCompleted:${accountId}`;
          const routingDecisionKey = `routingDecision:${accountId}`;
          
          if (sessionStorage.getItem(ensureCompletedKey)) {
            const routingDecision = sessionStorage.getItem(routingDecisionKey);
            
            if (routingDecision === "home") {
              // User completed onboarding - navigate to home
              const start = sessionStorage.getItem("msal.redirectStartPage") || "/";
              sessionStorage.removeItem("msal.redirectStartPage");
              console.info("[AUTH] AuthCallback: user completed onboarding, redirecting to home");
              navigate(start, { replace: true });
            } else {
              // User is new - navigate to choose-role
              console.info("[AUTH] AuthCallback: user is new, redirecting to choose-role");
              navigate("/choose-role", { replace: true });
            }
          } else {
            // Ensure hasn't completed yet, wait a bit and check again
            console.info("[AUTH] AuthCallback: waiting for ensure to complete...");
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Check again after waiting
            if (sessionStorage.getItem(ensureCompletedKey)) {
              const routingDecision = sessionStorage.getItem(routingDecisionKey);
              if (routingDecision === "home") {
                const start = sessionStorage.getItem("msal.redirectStartPage") || "/";
                sessionStorage.removeItem("msal.redirectStartPage");
                console.info("[AUTH] AuthCallback: ensure completed, redirecting to home");
                navigate(start, { replace: true });
              } else {
                console.info("[AUTH] AuthCallback: ensure completed, redirecting to choose-role");
                navigate("/choose-role", { replace: true });
              }
            } else {
              // Fallback if ensure still hasn't completed
              console.warn("[AUTH] AuthCallback: ensure didn't complete, defaulting to choose-role");
              navigate("/choose-role", { replace: true });
            }
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
