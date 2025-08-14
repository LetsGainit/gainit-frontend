import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { msal, initializeMsal } from "./auth/auth";
import "./css/index.css";
import App from "./App.jsx";

// Initialize MSAL and handle redirect promise before rendering
const initializeApp = async () => {
  try {
    // Initialize MSAL first
    await initializeMsal();
    // Handle any redirect response
    await msal.handleRedirectPromise();
  } catch (error) {
    console.error("MSAL initialization failed:", error);
  }

  // Render the app after MSAL is initialized
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <MsalProvider instance={msal}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MsalProvider>
    </StrictMode>
  );
};

initializeApp();
