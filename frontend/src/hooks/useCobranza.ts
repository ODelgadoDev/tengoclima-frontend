import { useCallback, useEffect, useState } from "react";
import { cobranzaApi } from "../api/cobranzaApi";
import type { CuentaPagada, CuentaPorCobrar } from "../types/cobranza";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

type Loader<T> = () => Promise<T[]>;

function useRemoteList<T>(loader: Loader<T>, fallbackMessage: string) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const response = await loader();
        if (!isActive) return;
        setItems(response);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(getApiErrorMessage(error, fallbackMessage));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isActive = false;
    };
  }, [fallbackMessage, loader, refreshKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setErrorMessage("");
    setRefreshKey((current) => current + 1);
  }, []);

  return { items, isLoading, errorMessage, reload };
}

const loadPorCobrar = () => cobranzaApi.getPorCobrar();
const loadPagados = () => cobranzaApi.getPagados();

export function useCuentasPorCobrar() {
  const result = useRemoteList<CuentaPorCobrar>(
    loadPorCobrar,
    "No fue posible cargar las cuentas por cobrar.",
  );

  return {
    cuentas: result.items,
    isLoading: result.isLoading,
    errorMessage: result.errorMessage,
    reload: result.reload,
  };
}

export function useCuentasPagadas() {
  const result = useRemoteList<CuentaPagada>(
    loadPagados,
    "No fue posible cargar las cotizaciones pagadas.",
  );

  return {
    cuentas: result.items,
    isLoading: result.isLoading,
    errorMessage: result.errorMessage,
    reload: result.reload,
  };
}
