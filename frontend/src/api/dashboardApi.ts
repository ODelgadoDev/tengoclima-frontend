import type {
  DashboardData,
  DashboardFinanzas,
  DashboardResumen,
} from "../types/dashboard";
import { cotizacionesApi } from "./cotizacionesApi";
import { apiClient } from "./axiosClient";
import { proyectosApi } from "./proyectosApi";

const RECENT_ITEMS_LIMIT = 5;

export const dashboardApi = {
  async getResumen(): Promise<DashboardResumen> {
    const response = await apiClient.get<DashboardResumen>(
      "/dashboard/resumen/",
    );

    return response.data;
  },

  async getFinanzas(): Promise<DashboardFinanzas> {
    const response = await apiClient.get<DashboardFinanzas>(
      "/dashboard/finanzas/",
    );

    return response.data;
  },

  async getDashboard(): Promise<DashboardData> {
    const [
      resumen,
      finanzas,
      proyectosResponse,
      cotizacionesResponse,
    ] = await Promise.all([
      this.getResumen(),
      this.getFinanzas(),
      proyectosApi.getProyectos({
        page: 1,
        page_size: RECENT_ITEMS_LIMIT,
        ordering: "-fecha_creacion",
      }),
      cotizacionesApi.getCotizaciones({
        page: 1,
        page_size: RECENT_ITEMS_LIMIT,
        ordering: "-fecha_creacion",
      }),
    ]);

    return {
      resumen,
      finanzas,
      proyectosRecientes: proyectosResponse.results,
      cotizacionesRecientes: cotizacionesResponse.results,
    };
  },
};
