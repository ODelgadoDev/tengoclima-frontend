import type { UsuarioResponsable } from "../types/proyecto";
import { apiClient } from "./axiosClient";

export const usuariosApi = {
  async getUsuariosActivos(): Promise<UsuarioResponsable[]> {
    const response = await apiClient.get<UsuarioResponsable[]>(
      "/auth/usuarios/",
    );

    return response.data;
  },
};
