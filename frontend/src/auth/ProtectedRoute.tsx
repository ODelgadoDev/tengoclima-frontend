import { Navigate, Outlet, useLocation } from "react-router-dom";

import { AuthLoadingScreen } from "./AuthLoadingScreen";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
  const location = useLocation();
  const { status, isAuthenticated } = useAuth();

  if (status === "checking") {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}