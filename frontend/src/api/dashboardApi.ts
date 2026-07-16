import { apiClient } from "./axiosClient";

import type {
  DashboardData,
  DashboardFinanzas,
  DashboardResumen,
} from "../types/dashboard";

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
    const [resumen, finanzas] = await Promise.all([
      this.getResumen(),
      this.getFinanzas(),
    ]);

    return {
      resumen,
      finanzas,
    };
  },
};