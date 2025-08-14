import {
  PublicClientApplication,
  InteractionRequiredAuthError,
  AccountInfo,
  BrowserAuthError
} from "@azure/msal-browser";
import { msalConfig, apiScopes, API_BASE } from "./msalConfig";

export const msal = new PublicClientApplication(msalConfig);

// Flag to track if MSAL is initialized
let isInitialized = false;

// Initialize MSAL
export async function initializeMsal(): Promise<void> {
  if (isInitialized) return;
  
  try {
    await msal.initialize();
    isInitialized = true;
  } catch (error) {
    console.error("Failed to initialize MSAL:", error);
    throw error;
  }
}

export async function signIn(): Promise<AccountInfo> {
  if (!isInitialized) {
    await initializeMsal();
  }
  
  const accounts = msal.getAllAccounts();
  if (accounts.length) {
    msal.setActiveAccount(accounts[0]);
    return accounts[0];
  }
  
  // Use loginRedirect instead of loginPopup for better UX
  await msal.loginRedirect({ scopes: apiScopes });
  throw new Error("Login redirect initiated");
}

export async function getAccessToken(): Promise<string> {
  if (!isInitialized) {
    await initializeMsal();
  }
  
  const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0];
  
  if (!account) {
    throw new Error("No account found. User must sign in first.");
  }
  
  try {
    const res = await msal.acquireTokenSilent({ account, scopes: apiScopes });
    return res.accessToken;
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) {
      // Use loginRedirect instead of popup
      await msal.acquireTokenRedirect({ account, scopes: apiScopes });
      throw new Error("Token acquisition redirect initiated");
    }
    throw e;
  }
}

/** קורא ל-API שיבטיח/יצור את המשתמש ומחזיר את UserProfileDto */
export async function ensureCurrentUser() {
  if (!isInitialized) {
    await initializeMsal();
  }
  
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/api/users/me/ensure`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ensure failed: ${res.status} ${body}`);
  }
  return (await res.json()) as {
    userId: string;
    externalId: string;
    emailAddress: string;
    fullName: string;
    country?: string;
    isNewUser: boolean;
  };
}  