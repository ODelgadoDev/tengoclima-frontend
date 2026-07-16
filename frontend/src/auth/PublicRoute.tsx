import { Navigate, Outlet } from "react-router-dom";

import { AuthLoadingScreen } from "./AuthLoadingScreen";
import { useAuth } from "./useAuth";

export function PublicRoute() {
  const { status, isAuthenticated } = useAuth();

  if (status === "checking") {
    return <AuthLoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}