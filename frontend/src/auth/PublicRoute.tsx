import { Navigate, Outlet } from "react-router-dom";
import { AuthLoadingScreen } from "./AuthLoadingScreen";
import { useAuth } from "./useAuth";

export function PublicRoute() {
  const { status, isAuthenticated, profile } = useAuth();
  if (status === "checking") return <AuthLoadingScreen />;
  if (isAuthenticated) {
    return <Navigate to={profile?.requiere_cambio_contrasena ? "/cambiar-contrasena-inicial" : "/dashboard"} replace />;
  }
  return <Outlet />;
}
