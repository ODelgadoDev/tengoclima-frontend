import { apiClient } from "./axiosClient";
import type { GlobalSearchResponse } from "../types/globalSearch";

export const globalSearchApi = {
  async search(
    query: string,
    signal?: AbortSignal,
  ): Promise<GlobalSearchResponse> {
    const response = await apiClient.get<GlobalSearchResponse>(
      "/busqueda-global/",
      {
        params: {
          q: query,
          limit: 5,
        },
        signal,
      },
    );

    return response.data;
  },
};
