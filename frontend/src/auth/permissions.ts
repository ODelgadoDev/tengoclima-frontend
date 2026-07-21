import type { AuthProfile, UserRole } from "../types/auth";

export const ROLE_LABELS: Record<UserRole, string> = {
  DUENO: "Dueño",
  ADMINISTRADOR: "Administrador",
  AYUDANTE: "Ayudante",
};

export function canManage(profile: AuthProfile | null): boolean {
  return Boolean(
    profile?.activo &&
      (profile.rol === "DUENO" || profile.rol === "ADMINISTRADOR"),
  );
}

export function isOwner(profile: AuthProfile | null): boolean {
  return Boolean(profile?.activo && profile.rol === "DUENO");
}

export function getProfileDisplayName(profile: AuthProfile | null): string {
  if (!profile) {
    return "Usuario";
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();

  return fullName || profile.username;
}
