import { useCallback, useEffect, useState } from "react";
import { contabilidadApi } from "../api/contabilidadApi";
import { dashboardApi } from "../api/dashboardApi";
import type {
  CategoriaGasto,
  Gasto,
  GastosQueryParams,
} from "../types/contabilidad";
import type { DashboardFinanzas } from "../types/dashboard";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export function useCategoriasGasto() {
  const [categorias, setCategorias] = useState<CategoriaGasto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const response = await contabilidadApi.getCategorias({
          page_size: 100,
          ordering: "nombre",
        });
        if (!isActive) return;
        setCategorias(response.results);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(
          getApiErrorMessage(
            error,
            "No fue posible cargar las categorías de gasto.",
          ),
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setErrorMessage("");
    setRefreshKey((current) => current + 1);
  }, []);

  return { categorias, isLoading, errorMessage, reload };
}

type UseGastosParams = Required<Pick<GastosQueryParams, "page" | "page_size">> &
  Omit<GastosQueryParams, "page" | "page_size">;

export function useGastos(params: UseGastosParams) {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    page,
    page_size,
    search,
    categoria,
    metodo_pago,
    fecha_gasto,
    ordering,
  } = params;

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const response = await contabilidadApi.getGastos({
          page,
          page_size,
          search,
          categoria,
          metodo_pago,
          fecha_gasto,
          ordering,
        });
        if (!isActive) return;
        setGastos(response.results);
        setCount(response.count);
        setNext(response.next);
        setPrevious(response.previous);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(
          getApiErrorMessage(error, "No fue posible cargar los gastos."),
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isActive = false;
    };
  }, [
    categoria,
    fecha_gasto,
    metodo_pago,
    ordering,
    page,
    page_size,
    refreshKey,
    search,
  ]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setErrorMessage("");
    setRefreshKey((current) => current + 1);
  }, []);

  return {
    gastos,
    count,
    next,
    previous,
    isLoading,
    errorMessage,
    reload,
  };
}

const emptyFinanzas: DashboardFinanzas = {
  monto_cobrado: 0,
  monto_por_cobrar: 0,
  total_gastos: 0,
  utilidad: 0,
};

export function useFinanzasContabilidad() {
  const [finanzas, setFinanzas] = useState<DashboardFinanzas>(emptyFinanzas);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const response = await dashboardApi.getFinanzas();
        if (!isActive) return;
        setFinanzas(response);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(
          getApiErrorMessage(
            error,
            "No fue posible cargar el resumen financiero.",
          ),
        );
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setErrorMessage("");
    setRefreshKey((current) => current + 1);
  }, []);

  return { finanzas, isLoading, errorMessage, reload };
}
