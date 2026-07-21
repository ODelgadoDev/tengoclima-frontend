import { useMemo } from "react";

import { useAuth } from "./useAuth";
import {
  canManage as canManageProfile,
  getProfileDisplayName,
  isOwner as isOwnerProfile,
  ROLE_LABELS,
} from "./permissions";

export function usePermissions() {
  const { profile } = useAuth();

  return useMemo(
    () => ({
      canManage: canManageProfile(profile),
      isOwner: isOwnerProfile(profile),
      isReadOnly: Boolean(profile && !canManageProfile(profile)),
      roleLabel: profile ? ROLE_LABELS[profile.rol] : "Sin perfil",
      displayName: getProfileDisplayName(profile),
    }),
    [profile],
  );
}
