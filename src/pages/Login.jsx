import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { apiScopes } from "../auth/msalConfig";

const Login = () => {
  const navigate = useNavigate();
  const { instance, accounts } = useMsal();

  useEffect(() => {
    console.log("🔧 [LOGIN] Login component mounted");
    console.log("🔧 [LOGIN] Current accounts:", accounts.length);
    
    // If user is already signed in, redirect to home
    if (accounts.length > 0) {
      console.log("✅ [LOGIN] User already signed in, redirecting to home");
      navigate("/");
      return;
    }

    // If not signed in, redirect to Azure login
    const redirectToLogin = async () => {
      console.log("🔧 [LOGIN] No accounts found, redirecting to Azure login");
      console.log("🔧 [LOGIN] Using scopes:", ["openid", "profile", "offline_access", ...apiScopes]);
      
      try {
        await instance.loginRedirect({
          scopes: ["openid", "profile", "offline_access", ...apiScopes],
          redirectStartPage: `${window.location.origin}/`,
        });
        console.log("✅ [LOGIN] Login redirect initiated");
      } catch (error) {
        console.error("❌ [LOGIN] Error initiating login redirect:", error);
      }
    };

    redirectToLogin();
  }, [accounts.length, instance, navigate]);

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "60px auto",
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 8,
        background: "#fff",
        textAlign: "center",
      }}
    >
      <h2 style={{ marginBottom: 24 }}>Redirecting to Login...</h2>
      <p>You will be redirected to Azure login shortly.</p>
    </div>
  );
};

export default Login;
