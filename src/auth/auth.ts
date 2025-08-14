import {
    PublicClientApplication,
    InteractionRequiredAuthError,
    AccountInfo
  } from "@azure/msal-browser";
  import { msalConfig, apiScopes, API_BASE } from "./msalConfig";
  
  export const msal = new PublicClientApplication(msalConfig);
  
  export async function signIn(): Promise<AccountInfo> {
    const accounts = msal.getAllAccounts();
    if (accounts.length) {
      msal.setActiveAccount(accounts[0]);
      return accounts[0];
    }
    const res = await msal.loginPopup({ scopes: apiScopes });
    if (res.account) msal.setActiveAccount(res.account);
    return res.account!;
  }
  
  export async function getAccessToken(): Promise<string> {
    const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0] ?? (await signIn());
    try {
      const res = await msal.acquireTokenSilent({ account, scopes: apiScopes });
      return res.accessToken;
    } catch (e) {
      if (e instanceof InteractionRequiredAuthError) {
        const res = await msal.acquireTokenPopup({ account, scopes: apiScopes });
        return res.accessToken;
      }
      throw e;
    }
  }
  
  /** קורא ל-API שיבטיח/יצור את המשתמש ומחזיר את UserProfileDto */
  export async function ensureCurrentUser() {
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