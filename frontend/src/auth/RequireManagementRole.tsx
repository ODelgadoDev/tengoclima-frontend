import { Navigate, Outlet, useLocation } from "react-router-dom";

import { canManage } from "./permissions";
import { useAuth } from "./useAuth";

export function RequireManagementRole() {
  const location = useLocation();
  const { profile } = useAuth();

  if (!canManage(profile)) {
    return (
      <Navigate
        to="/sin-permiso"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
