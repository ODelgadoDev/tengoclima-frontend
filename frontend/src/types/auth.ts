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
  usuario_id: number;
  username: string;
  first_name: string;
  last_name: string;
  nombre_completo: string;
  email: string;
  rol: UserRole;
  telefono: string | null;
  foto_perfil: string | null;
  activo: boolean;
  requiere_cambio_contrasena: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface UpdateProfilePayload {
  first_name: string;
  last_name: string;
  email: string;
  telefono: string;
  foto_perfil?: File | null;
  eliminar_foto?: boolean;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ApiSuccessResponse {
  success: boolean;
  message: string;
}
