import { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { getUserInfo, fetchUserProfile } from '../auth/auth';

interface UserInfo {
  userId: string;
  role: string;
  email: string;
  name: string;
  externalId: string;
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
      const info = await getUserInfo();
      setUserInfo(info);
      
      // Fetch profile data
      const profile = await fetchUserProfile(info.role, info.userId);
      setProfileData(profile);
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

  const refreshUserData = useCallback(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  const signOut = useCallback(async () => {
    try {
      await instance.logoutRedirect();
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
    signOut,
    accounts,
  };
}
