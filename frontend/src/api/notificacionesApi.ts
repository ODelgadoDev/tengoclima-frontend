import { apiClient } from "./axiosClient";
import type {
  NotificationBulkActionResponse,
  NotificationQueryParams,
  NotificationRecord,
  NotificationSummary,
  PaginatedNotifications,
} from "../types/notificacion";

function normalizeParams(
  params: NotificationQueryParams,
): NotificationQueryParams {
  return {
    page: params.page,
    page_size: params.page_size,
    leida: params.leida,
    tipo: params.tipo || undefined,
    search: params.search?.trim() || undefined,
    ordering: params.ordering?.trim() || "-fecha_creacion",
  };
}

export const NOTIFICATIONS_CHANGED_EVENT =
  "tengoclima:notificaciones-actualizadas";

export function emitNotificationsChanged(): void {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export const notificacionesApi = {
  async getSummary(): Promise<NotificationSummary> {
    const response = await apiClient.get<NotificationSummary>(
      "/notificaciones/resumen/",
    );
    return response.data;
  },

  async getNotifications(
    params: NotificationQueryParams = {},
  ): Promise<PaginatedNotifications> {
    const response = await apiClient.get<PaginatedNotifications>(
      "/notificaciones/",
      { params: normalizeParams(params) },
    );
    return response.data;
  },

  async markRead(id: number): Promise<NotificationRecord> {
    const response = await apiClient.post<NotificationRecord>(
      `/notificaciones/${id}/marcar-leida/`,
    );
    return response.data;
  },

  async markUnread(id: number): Promise<NotificationRecord> {
    const response = await apiClient.post<NotificationRecord>(
      `/notificaciones/${id}/marcar-no-leida/`,
    );
    return response.data;
  },

  async markAllRead(): Promise<NotificationBulkActionResponse> {
    const response = await apiClient.post<NotificationBulkActionResponse>(
      "/notificaciones/marcar-todas-leidas/",
    );
    return response.data;
  },

  async deleteNotification(id: number): Promise<void> {
    await apiClient.delete(`/notificaciones/${id}/`);
  },

  async deleteRead(): Promise<NotificationBulkActionResponse> {
    const response = await apiClient.delete<NotificationBulkActionResponse>(
      "/notificaciones/eliminar-leidas/",
    );
    return response.data;
  },
};
