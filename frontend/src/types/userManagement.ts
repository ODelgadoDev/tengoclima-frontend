import type { UserRole } from "./auth";
import type { PaginatedResponse } from "./client";

export interface ManagedUser {
  id: number;
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
  last_login: string | null;
}

export interface ManagedUserCreatePayload {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  rol: UserRole;
  telefono: string;
  password: string;
  password_confirm: string;
}

export interface ManagedUserUpdatePayload {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  rol?: UserRole;
  telefono?: string;
}

export interface ResetPasswordPayload {
  password: string;
  password_confirm: string;
}

export interface UsersQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  perfilusuario__rol?: UserRole;
  is_active?: boolean;
  ordering?: string;
}

export type ActivityAction =
  | "CREAR"
  | "EDITAR"
  | "ELIMINAR"
  | "RESTAURAR"
  | "ELIMINAR_DEFINITIVO"
  | "ACTIVAR"
  | "DESACTIVAR"
  | "CAMBIAR_CONTRASENA"
  | "RESTABLECER_CONTRASENA";

export interface ActivityRecord {
  id: number;
  usuario_id: number | null;
  usuario_username: string | null;
  usuario_nombre: string;
  accion: ActivityAction;
  accion_nombre: string;
  modelo: string;
  modelo_etiqueta: string;
  objeto_id: string;
  objeto_repr: string;
  descripcion: string;
  cambios: Record<string, { antes?: unknown; despues?: unknown }>;
  ruta: string;
  fecha: string;
}

export interface ActivityQueryParams {
  page?: number;
  page_size?: number;
  usuario?: number;
  accion?: ActivityAction | "";
  modelo?: string;
  search?: string;
  ordering?: string;
}

export type PaginatedUsers = PaginatedResponse<ManagedUser>;
export type PaginatedActivities = PaginatedResponse<ActivityRecord>;
