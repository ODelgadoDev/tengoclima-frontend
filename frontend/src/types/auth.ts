export type UserRole = "DUENO" | "ADMINISTRADOR" | "AYUDANTE";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
  refresh?: string;
}

export interface AuthProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  rol: UserRole;
  telefono: string | null;
  activo: boolean;
  fecha_creacion: string;
}
