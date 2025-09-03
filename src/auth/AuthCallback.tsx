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
          // Routing centralized in RoleCheck; avoid early redirects here
          // Just redirect to home and let RoleCheck handle role-based routing
          const start = sessionStorage.getItem("msal.redirectStartPage") || "/";
          sessionStorage.removeItem("msal.redirectStartPage");
          console.info("[AUTH] AuthCallback: redirecting to start page, RoleCheck will handle role-based routing");
          navigate(start, { replace: true });
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
