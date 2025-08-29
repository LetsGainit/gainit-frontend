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
        console.debug("[AUTH] Ensuring user in backend…");
        ensureCurrentUser()
          .then((user) => {
            console.info("[AUTH] Ensure success:", { userId: user.userId, isNewUser: user.isNewUser });
          })
          .catch((e) => {
            console.error("[AUTH] Ensure failed:", e);
          })
          .finally(() => sessionStorage.setItem(ensureKey, "true"));
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
