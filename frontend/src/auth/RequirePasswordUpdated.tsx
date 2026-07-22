import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

export function RequirePasswordUpdated() {
  const { profile } = useAuth();
  if (profile?.requiere_cambio_contrasena) return <Navigate to="/cambiar-contrasena-inicial" replace />;
  return <Outlet />;
}
