import { createContext } from "react";
import type { AuthProfile, LoginCredentials } from "../types/auth";

export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export interface AuthContextValue {
  status: AuthStatus;
  isAuthenticated: boolean;
  profile: AuthProfile | null;
  login: (credentials: LoginCredentials) => Promise<AuthProfile>;
  logout: () => void;
  refreshProfile: () => Promise<AuthProfile>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
