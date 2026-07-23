import type { PaginatedResponse } from "./client";

export type NotificationType =
  | "PROYECTO_ASIGNADO"
  | "COTIZACION_AUTORIZADA"
  | "COTIZACION_CANCELADA"
  | "FACTURA_CREADA"
  | "FACTURA_PAGADA"
  | "PAGO_REGISTRADO"
  | "PROYECTO_PROXIMO"
  | "PROYECTO_ATRASADO"
  | "ARCHIVO_NUEVO"
  | "USUARIO_CREADO"
  | "USUARIO_ACTIVADO"
  | "USUARIO_DESACTIVADO"
  | "SISTEMA";

export type NotificationLevel =
  | "INFO"
  | "EXITO"
  | "ADVERTENCIA"
  | "ERROR";

export interface NotificationRecord {
  id: number;
  tipo: NotificationType;
  tipo_display: string;
  nivel: NotificationLevel;
  nivel_display: string;
  titulo: string;
  mensaje: string;
  ruta: string;
  modelo: string;
  objeto_id: string;
  leida: boolean;
  fecha_lectura: string | null;
  fecha_creacion: string;
  actor_nombre: string;
}

export interface NotificationSummary {
  total: number;
  no_leidas: number;
  ultimas: NotificationRecord[];
}

export interface NotificationQueryParams {
  page?: number;
  page_size?: number;
  leida?: boolean;
  tipo?: NotificationType | "";
  search?: string;
  ordering?: string;
}

export interface NotificationBulkActionResponse {
  success: boolean;
  message: string;
  actualizadas?: number;
  eliminadas?: number;
}

export type PaginatedNotifications = PaginatedResponse<NotificationRecord>;
