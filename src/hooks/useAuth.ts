import { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { getUserInfo, fetchUserProfile } from '../auth/auth';

interface UserInfo {
  userId: string;
  role: string | undefined;
  email: string;
  name: string;
  externalId: string;
  isNewUser: boolean;
}

interface ProfileData {
  [key: string]: any;
}

export function useAuth() {
  const { instance, accounts } = useMsal();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = accounts.length > 0;

  const loadUserInfo = useCallback(async () => {
    if (!isAuthenticated) {
      setUserInfo(null);
      setProfileData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if userInfo was stored during ensure flow
      const accountId = accounts[0]?.homeAccountId ?? "unknown";
      const storedUserInfo = sessionStorage.getItem(`userInfo:${accountId}`);
      
      let info;
      if (storedUserInfo) {
        // Use stored userInfo from ensure flow
        info = JSON.parse(storedUserInfo);
        sessionStorage.removeItem(`userInfo:${accountId}`); // Clean up
      } else {
        // Fetch userInfo normally
        info = await getUserInfo();
      }
      
      setUserInfo(info);
      
      // Only fetch profile data if user has a role
      if (info.role) {
        try {
          const profile = await fetchUserProfile(info.role, info.userId);
          setProfileData(profile);
        } catch (profileError) {
          console.warn("Failed to fetch profile data:", profileError);
          // Don't fail completely if profile fetch fails
        }
      } else {
        console.log("User hasn't completed onboarding, profile data not fetched");
        setProfileData(null);
      }
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        // Token expired, need to re-authenticate
        try {
          await instance.acquireTokenRedirect({
            scopes: ["openid", "profile", "offline_access", "api://gainitwebapp-dvhfcxbkezgyfwf6.israelcentral-01.azurewebsites.net/access_as_user"],
          });
        } catch (loginError) {
          console.error("Failed to acquire token:", loginError);
          setError("Authentication failed. Please try signing in again.");
        }
      } else {
        console.error("Failed to load user info:", err);
        setError(err instanceof Error ? err.message : "Failed to load user information");
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, instance]);

  const markOnboardingComplete = useCallback(() => {
    setUserInfo(prev => {
      if (prev) {
        return { ...prev, isNewUser: false };
      }
      return prev;
    });
  }, []);

  const refreshUserData = useCallback(() => {
    // Skip refresh on sensitive routes
    // Note: Removed /choose-role and /onboarding/* to allow profile fetch and learn user's onboarding status
    const SKIP_FETCH = new Set([
      "/auth-callback",
    ]);
    
    if (SKIP_FETCH.has(window.location.pathname)) {
      console.info("[AUTH] useAuth: skipping refresh on", window.location.pathname);
      return Promise.resolve();
    }
    
    return loadUserInfo();
  }, [loadUserInfo]);

  useEffect(() => {
    // Skip auto-fetch on sensitive routes to avoid concurrent /me/redirect churn
    // Note: Removed /choose-role and /onboarding/* to allow profile fetch and learn user's onboarding status
    const SKIP_FETCH = new Set([
      "/auth-callback",
    ]);
    
    if (SKIP_FETCH.has(window.location.pathname)) {
      console.info("[AUTH] useAuth: skipping fetch on", window.location.pathname);
      return;
    }
    
    loadUserInfo();
  }, [loadUserInfo]);

  const signOut = useCallback(async () => {
    try {
      // Clear local auth state first
      setUserInfo(null);
      setProfileData(null);
      setError(null);
      
      // Perform MSAL logout with redirect to home
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin + "/"
      });
    } catch (err) {
      console.error("Sign out failed:", err);
    }
  }, [instance]);

  return {
    isAuthenticated,
    userInfo,
    profileData,
    loading,
    error,
    refreshUserData,
    markOnboardingComplete,
    signOut,
    accounts,
  };
}
