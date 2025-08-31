import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MsalProvider } from "@azure/msal-react";
import { initializeMsal, getMsalInstance } from "./auth/auth";

import "./css/index.css";
import App from "./App.jsx";

// Initialize MSAL and handle redirect promise before rendering
const initializeApp = async () => {
  try {
    // Initialize MSAL first
    await initializeMsal();
  } catch (error) {
    console.error("MSAL initialization failed:", error);
  }

  // Get the MSAL instance after initialization
  const msalInstance = getMsalInstance();

  // Render the app after MSAL is initialized
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </MsalProvider>
    </StrictMode>
  );
};

initializeApp();
