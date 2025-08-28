// src/AuthCallback.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { ensureCurrentUser } from "./auth";

export default function AuthCallback() {
  const { inProgress, accounts } = useMsal();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("🔄 [AUTH_CALLBACK] useEffect triggered");
    console.log("🔄 [AUTH_CALLBACK] inProgress:", inProgress);
    console.log("🔄 [AUTH_CALLBACK] accounts length:", accounts.length);
    console.log("🔄 [AUTH_CALLBACK] accounts:", accounts);

    // 1) Wait until MSAL finished handleRedirectPromise (initialized in initializeMsal)
    if (inProgress !== InteractionStatus.None) {
      console.log("⏳ [AUTH_CALLBACK] Waiting for MSAL interaction to complete...");
      return;
    }

    const go = async () => {
      console.log("🚀 [AUTH_CALLBACK] Starting authentication callback process...");
      try {
        // 2) If we have an account, it's safe to call backend and then redirect
        if (accounts.length > 0) {
          console.log("✅ [AUTH_CALLBACK] Found account, proceeding with ensureCurrentUser");
          console.log("✅ [AUTH_CALLBACK] Account details:", {
            username: accounts[0].username,
            name: accounts[0].name,
            homeAccountId: accounts[0].homeAccountId
          });

          try {
            
            console.log("🔧 [AUTH_CALLBACK] Calling ensureCurrentUser...");
            const userResult = await ensureCurrentUser(); // optional but recommended for first-run user provisioning
            console.log("✅ [AUTH_CALLBACK] ensureCurrentUser completed successfully:", userResult);
          } catch (e) {
            console.error("❌ [AUTH_CALLBACK] ensureCurrentUser failed:", e);
            // We won't block navigation just because ensure failed
          }

          // 3) Redirect to the original page if set, otherwise Home
          const start = sessionStorage.getItem("msal.redirectStartPage") || "/";
          console.log("🔧 [AUTH_CALLBACK] Redirecting to:", start);
          sessionStorage.removeItem("msal.redirectStartPage");
          navigate(start, { replace: true });
        } else {
          // No account => user canceled or an auth error occurred
          console.error("❌ [AUTH_CALLBACK] No account found after login redirect");
          setError("No account found after login redirect.");
          navigate("/", { replace: true });
        }
      } catch (e: any) {
        console.error("❌ [AUTH_CALLBACK] Error in authentication callback:", e);
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
