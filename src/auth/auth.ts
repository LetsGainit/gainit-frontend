// src/auth/auth.ts
import {
  PublicClientApplication,
  EventType,
  AuthenticationResult,
  InteractionRequiredAuthError,
  AccountInfo,
} from "@azure/msal-browser";
import { msalConfig, apiScopes, API_BASE } from "./msalConfig";

let msal: PublicClientApplication;
let eventsAttached = false;

function attachEventCallbacks(instance: PublicClientApplication) {
  if (eventsAttached) return;

  instance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      instance.setActiveAccount(payload.account);
      console.info("[AUTH] LOGIN_SUCCESS:", payload.account?.username);

      // Ensure user exists in backend once per account per session
      const accountId = payload.account?.homeAccountId ?? "unknown";
      const ensureKey = `userEnsured:${accountId}`;
      if (!sessionStorage.getItem(ensureKey)) {
        console.info("[ENSURE] triggered on LOGIN_SUCCESS");
        console.debug("[AUTH] Ensuring user in backend…");
        
        // Execute ensure-first flow: always call ensure, then use isNewUser for routing
        ensureCurrentUser()
          .then(async (user) => {
            console.info("[ENSURE] response", { isNewUser: user.isNewUser });
            
            if (user.isNewUser === false) {
              // User completed onboarding - fetch full profile and navigate to home
              console.info("[ENSURE] User completed onboarding, fetching full profile");
              try {
                const userInfo = await getUserInfo();
                sessionStorage.setItem(`userInfo:${accountId}`, JSON.stringify(userInfo));
                sessionStorage.setItem(`ensureCompleted:${accountId}`, "true");
                sessionStorage.setItem(`routingDecision:${accountId}`, "home");
                
                // Trigger navigation to home immediately
                setTimeout(() => {
                  const start = sessionStorage.getItem("msal.redirectStartPage") || "/";
                  sessionStorage.removeItem("msal.redirectStartPage");
                  window.location.href = start;
                }, 100);
              } catch (profileError) {
                console.warn("[ENSURE] Failed to fetch profile, treating as new user:", profileError);
                sessionStorage.setItem(`ensureCompleted:${accountId}`, "true");
                sessionStorage.setItem(`routingDecision:${accountId}`, "choose-role");
                
                // Trigger navigation to choose-role immediately (unless just finished onboarding)
                setTimeout(() => {
                  if (sessionStorage.getItem("justFinishedOnboarding") !== "true") {
                    window.location.href = "/choose-role";
                  }
                }, 100);
              }
            } else {
              // User is new (or isNewUser is true/undefined) - navigate to choose-role immediately
              console.info("[ENSURE] User is new, navigating to choose-role immediately");
              sessionStorage.setItem(`ensureCompleted:${accountId}`, "true");
              sessionStorage.setItem(`routingDecision:${accountId}`, "choose-role");
              
              // Trigger navigation to choose-role immediately (unless just finished onboarding)
              setTimeout(() => {
                if (sessionStorage.getItem("justFinishedOnboarding") !== "true") {
                  window.location.href = "/choose-role";
                }
              }, 100);
            }
            return user;
          })
          .catch((e) => {
            console.warn("[ENSURE] failed:", e.message);
            // On ensure failure, treat as new user
            sessionStorage.setItem(`ensureCompleted:${accountId}`, "true");
            sessionStorage.setItem(`routingDecision:${accountId}`, "choose-role");
            
            // Trigger navigation to choose-role immediately on failure (unless just finished onboarding)
            setTimeout(() => {
              if (sessionStorage.getItem("justFinishedOnboarding") !== "true") {
                window.location.href = "/choose-role";
              }
            }, 100);
            throw e;
          })
          .finally(() => {
            sessionStorage.setItem(ensureKey, "true");
          });
      }
    }
  });

  eventsAttached = true;
}

export function getMsalInstance(): PublicClientApplication {
  if (!msal) throw new Error("MSAL not initialized. Call initializeMsal() first.");
  return msal;
}

export async function initializeMsal(): Promise<void> {
  console.debug("[AUTH] initializeMsal called");
  if (msal) {
    attachEventCallbacks(msal);
    console.debug("[AUTH] initializeMsal: already initialized");
    return;
  }

  msal = new PublicClientApplication(msalConfig);
  attachEventCallbacks(msal);
  await msal.initialize();

  const result = await msal.handleRedirectPromise();
  if (result?.account) {
    msal.setActiveAccount(result.account);
    console.debug("[AUTH] Active account (redirect):", result.account.username);
  } else {
    const acc = msal.getAllAccounts()[0];
    if (acc) {
      msal.setActiveAccount(acc);
      console.debug("[AUTH] Active account (cache):", acc.username);
    }
  }
}

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
    console.error("[AUTH] acquireTokenSilent failed:", e);
    throw e;
  }
}

export async function ensureCurrentUser() {
  await initializeMsal();
  const token = await getAccessToken();
  const url = `${API_BASE}api/users/me/ensure`;
  console.debug("[AUTH] POST:", url);
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("[AUTH] Ensure HTTP error:", res.status, body);
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

export async function getUserInfo() {
  await initializeMsal();
  const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0];
  if (!account) throw new Error("No account found. User must sign in first.");

  try {
    // Try to get user info from the /me endpoint first
    const token = await getAccessToken();
    const url = `${API_BASE}api/users/me`;
    console.debug("[AUTH] GET:", url);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (res.ok) {
      const userInfo = await res.json();
      return {
        userId: userInfo.userId || account.localAccountId,
        role: userInfo.role || userInfo.userType, // Remove default fallback - let role be undefined if not provided
        email: userInfo.emailAddress || account.username,
        name: userInfo.fullName || account.name,
        externalId: userInfo.externalId || account.localAccountId,
        isNewUser: userInfo.isNewUser, // Include isNewUser field from API response
      };
    } else if (res.status === 404) {
      // User doesn't exist in backend - this shouldn't happen with ensure-first flow
      // but if it does, treat as new user
      console.warn("[AUTH] User not found (404) - this shouldn't happen with ensure-first flow");
      return {
        userId: account.localAccountId,
        role: undefined,
        email: account.username,
        name: account.name,
        externalId: account.localAccountId,
        isNewUser: true,
      };
    } else if (res.status === 401 || res.status === 403) {
      // Token expired or insufficient permissions, try to refresh
      throw new InteractionRequiredAuthError();
    } else {
      // Other error, fall back to account info
      console.warn("[AUTH] /me endpoint failed, using account info:", res.status);
      return {
        userId: account.localAccountId,
        role: undefined, // No default role - let user choose
        email: account.username,
        name: account.name,
        externalId: account.localAccountId,
        isNewUser: true, // Default to new user if API fails
      };
    }
  } catch (e) {
    if (e instanceof InteractionRequiredAuthError) {
      throw e;
    }
    console.warn("[AUTH] getUserInfo failed, using account info:", e);
    // Fallback to account info
    return {
      userId: account.localAccountId,
      role: undefined, // No default role - let user choose
      email: account.username,
      name: account.name,
      externalId: account.localAccountId,
      isNewUser: true, // Default to new user if API fails
    };
  }
}

export async function fetchUserProfile(role: string, userId: string) {
  await initializeMsal();
  const token = await getAccessToken();
  
  // Role to endpoint mapping
  const roleEndpoints = {
    gainer: `api/users/gainer/${userId}/profile`,
    mentor: `api/users/mentor/${userId}/profile`,
    nonprofit: `api/users/nonprofit/${userId}/profile`,
  };
  
  const endpoint = roleEndpoints[role.toLowerCase()];
  if (!endpoint) {
    throw new Error(`Unknown user role: ${role}`);
  }
  
  const url = `${API_BASE}${endpoint}`;
  console.debug("[AUTH] GET profile:", url);
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new InteractionRequiredAuthError();
    }
    const body = await res.text();
    throw new Error(`Profile fetch failed: ${res.status} ${body}`);
  }
  
  return await res.json();
}

export async function fetchPublicUserProfile(role: string, userId: string) {
  // Role to endpoint mapping
  const roleEndpoints = {
    gainer: `api/users/gainer/${userId}/profile`,
    mentor: `api/users/mentor/${userId}/profile`,
    nonprofit: `api/users/nonprofit/${userId}/profile`,
  };
  
  const endpoint = roleEndpoints[role.toLowerCase()];
  if (!endpoint) {
    throw new Error(`Unknown user role: ${role}`);
  }
  
  const url = `${API_BASE}${endpoint}`;
  console.debug("[AUTH] GET public profile:", url);
  
  const res = await fetch(url);
  
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Profile fetch failed: ${res.status} ${body}`);
  }
  
  return await res.json();
}
