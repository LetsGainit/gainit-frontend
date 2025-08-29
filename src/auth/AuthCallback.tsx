// src/AuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { ensureCurrentUser } from "./auth";

export default function AuthCallback() {
  const { inProgress, accounts } = useMsal();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1) Wait until MSAL finished handleRedirectPromise (initialized in initializeMsal)
    if (inProgress !== InteractionStatus.None) return;

    const go = async () => {
      try {
        // 2) If we have an account, it's safe to call backend and then redirect
        if (accounts.length > 0) {
          try {
            await ensureCurrentUser(); // optional but recommended for first-run user provisioning
            
          } catch (e) {
            console.error("ensureCurrentUser failed:", e);
            // We won't block navigation just because ensure failed
          }

          // 3) Redirect to the original page if set, otherwise Home
          const start = sessionStorage.getItem("msal.redirectStartPage") || "/";
          sessionStorage.removeItem("msal.redirectStartPage");
          navigate(start, { replace: true });
        } else {
          // No account => user canceled or an auth error occurred
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
