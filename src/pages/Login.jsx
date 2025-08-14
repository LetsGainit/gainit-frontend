import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { apiScopes } from "../auth/msalConfig";

const Login = () => {
  const navigate = useNavigate();
  const { instance, accounts } = useMsal();

  useEffect(() => {
    // If user is already signed in, redirect to home
    if (accounts.length > 0) {
      navigate("/");
      return;
    }

    // If not signed in, redirect to Azure login
    const redirectToLogin = async () => {
      await instance.loginRedirect({
        scopes: apiScopes,
        redirectStartPage: `${window.location.origin}/`,
      });
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
