import { useEffect, useState } from "react";
import { evidenciasApi } from "../api/evidenciasApi";
import type {
  ArchivoTrabajo,
  ArchivosQueryParams,
} from "../types/evidencia";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export function useArchivosTrabajo(params: ArchivosQueryParams) {
  const [archivos, setArchivos] = useState<ArchivoTrabajo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const cotizacion = params.cotizacion;
  const proyecto = params.proyecto;

  useEffect(() => {
    let isActive = true;

    evidenciasApi
      .getArchivos({
        cotizacion,
        proyecto,
        page_size: 100,
        ordering: "-fecha_creacion",
      })
      .then((response) => {
        if (isActive) {
          setArchivos(response.results);
          setErrorMessage("");
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar los archivos.",
            ),
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [cotizacion, proyecto, refreshKey]);

  const refresh = () => {
    setIsLoading(true);
    setRefreshKey((current) => current + 1);
  };

  return {
    archivos,
    isLoading,
    errorMessage,
    refresh,
  };
}
