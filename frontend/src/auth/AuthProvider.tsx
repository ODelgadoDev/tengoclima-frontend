import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/authApi";
import { tokenStorage } from "../services/tokenStorage";
import type { AuthProfile, LoginCredentials } from "../types/auth";
import { AuthContext, type AuthContextValue, type AuthStatus } from "./AuthContext";

interface AuthProviderProps { children: ReactNode; }

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [profile, setProfile] = useState<AuthProfile | null>(null);

  const refreshProfile = useCallback(async () => {
    const currentProfile = await authApi.getProfile();
    if (!currentProfile.activo) throw new Error("El perfil de usuario está inactivo.");
    setProfile(currentProfile);
    setStatus("authenticated");
    return currentProfile;
  }, []);

  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      const accessToken = tokenStorage.getAccessToken();
      const refreshToken = tokenStorage.getRefreshToken();
      if (!accessToken && !refreshToken) {
        if (isMounted) { setStatus("unauthenticated"); setProfile(null); }
        return;
      }
      try {
        const currentProfile = await authApi.getProfile();
        if (!currentProfile.activo) throw new Error("El perfil de usuario está inactivo.");
        if (isMounted) { setProfile(currentProfile); setStatus("authenticated"); }
      } catch {
        tokenStorage.clear();
        if (isMounted) { setProfile(null); setStatus("unauthenticated"); }
      }
    };
    void restoreSession();
    return () => { isMounted = false; };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setStatus("checking");
    try {
      const tokens = await authApi.login(credentials);
      tokenStorage.setTokens(tokens);
      const currentProfile = await authApi.getProfile();
      if (!currentProfile.activo) throw new Error("El perfil de usuario está inactivo.");
      setProfile(currentProfile);
      setStatus("authenticated");
      return currentProfile;
    } catch (error) {
      tokenStorage.clear(); setProfile(null); setStatus("unauthenticated"); throw error;
    }
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear(); setProfile(null); setStatus("unauthenticated");
  }, []);

  const contextValue = useMemo<AuthContextValue>(() => ({
    status,
    isAuthenticated: status === "authenticated",
    profile,
    login,
    logout,
    refreshProfile,
  }), [status, profile, login, logout, refreshProfile]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
