// src/auth/auth.ts
import {
  PublicClientApplication,
  EventType,
  AuthenticationResult,
  InteractionRequiredAuthError,
  AccountInfo,
} from "@azure/msal-browser";
import { msalConfig, apiScopes, API_BASE } from "./msalConfig";

export const msal = new PublicClientApplication(msalConfig);

let isInitialized = false;

/**
 * Initialize MSAL once:
 * - Add event callback for LOGIN_SUCCESS
 * - Run handleRedirectPromise() to capture redirect results
 * - Set active account (from redirect or from cache)
 */
export async function initializeMsal(): Promise<void> {
  if (isInitialized) return;

  // Event callback: set active account immediately after LOGIN_SUCCESS
  msal.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      msal.setActiveAccount(payload.account);
      console.log("Active account (event):", payload.account?.username);
    }
  });

  await msal.initialize();

  // Handle redirect result if we just returned from B2C
  const result = await msal.handleRedirectPromise();
  if (result?.account) {
    msal.setActiveAccount(result.account);
    console.log("Active account (redirect):", result.account.username);
  } else {
    // If no redirect result, try to restore from cache
    const acc = msal.getAllAccounts()[0];
    if (acc) {
      msal.setActiveAccount(acc);
      console.log("Active account (cache):", acc.username);
    }
  }

  isInitialized = true;
}

/**
 * Login with Redirect.
 * If account already exists in cache, set it and return.
 * Otherwise trigger redirect login flow.
 */
export async function signIn(): Promise<AccountInfo> {
  await initializeMsal();

  const accounts = msal.getAllAccounts();
  if (accounts.length) {
    msal.setActiveAccount(accounts[0]);
    return accounts[0];
  }

  await msal.loginRedirect({
    scopes: ["openid", "profile", "offline_access", ...apiScopes],
    authority: msal.getConfiguration().auth.authority,
  });

  throw new Error("Login redirect initiated");
}

/**
 * Acquire an access token (silent first, then redirect if needed).מ
 */
export async function getAccessToken(): Promise<string> {
  await initializeMsal();

  const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0];
  if (!account) throw new Error("No account found. User must sign in first.");

  try {
    const res = await msal.acquireTokenSilent({ account, scopes: apiScopes });
    return res.accessToken;
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) {
      await msal.acquireTokenRedirect({ account, scopes: apiScopes });
      throw new Error("Token acquisition redirect initiated");
    }
    throw e;
  }
}

/**
 * Example API call: POST /api/users/me/ensure
 * Ensures the current user exists in backend and returns profile.
 */
export async function ensureCurrentUser() {
  console.log("🔧 [AUTH] Ensuring current user in backend...");
  await initializeMsal();

  try {
    const token = await getAccessToken();
    console.log("✅ [AUTH] Got access token for ensureCurrentUser");
    
    const url = `${API_BASE}/api/users/me/ensure`;
    console.log("🔧 [AUTH] Making request to:", url);
    console.log("🔧 [AUTH] Using token:", token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    const res = await fetch(url, {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    console.log("🔧 [AUTH] Response status:", res.status);
    console.log("🔧 [AUTH] Response status text:", res.statusText);
    console.log("🔧 [AUTH] Response headers:", Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      const body = await res.text();
      console.error("❌ [AUTH] Ensure failed:", res.status, body);
      console.error("❌ [AUTH] Full error details:", {
        status: res.status,
        statusText: res.statusText,
        url: url,
        headers: Object.fromEntries(res.headers.entries()),
        body: body
      });
      throw new Error(`Ensure failed: ${res.status} ${body}`);
    }

    const userData = await res.json();
    console.log("✅ [AUTH] User ensured successfully:", userData);
    return userData as {
      userId: string;
      externalId: string;
      emailAddress: string;
      fullName: string;
      country?: string;
      isNewUser: boolean;
    };
  } catch (error) {
    console.error("❌ [AUTH] Error in ensureCurrentUser:", error);
    console.error("❌ [AUTH] Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}
