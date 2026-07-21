import { useEffect, useState } from "react";
import { evidenciasApi } from "../api/evidenciasApi";
import type { Evidencia } from "../types/evidencia";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export function useEvidencias(cotizacionId: number) {
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadEvidencias = async () => {
      try {
        const response = await evidenciasApi.getEvidencias({
          cotizacion: cotizacionId,
          page_size: 100,
          ordering: "-fecha_creacion",
        });

        if (isActive) {
          setEvidencias(response.results);
          setErrorMessage("");
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar las evidencias.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadEvidencias();

    return () => {
      isActive = false;
    };
  }, [cotizacionId, refreshKey]);

  const refresh = () => {
    setIsLoading(true);
    setRefreshKey((current) => current + 1);
  };

  return {
    evidencias,
    isLoading,
    errorMessage,
    refresh,
  };
}
