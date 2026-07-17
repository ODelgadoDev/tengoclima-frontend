import { useCallback, useEffect, useMemo, useState } from "react";

import { cotizacionesApi } from "../api/cotizacionesApi";
import type {
  Cotizacion,
  CotizacionesQueryParams,
  EstadoCotizacion,
  TipoCotizacion,
} from "../types/cotizacion";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const DEFAULT_PAGE_SIZE = 10;
const COTIZACIONES_ERROR_MESSAGE =
  "No fue posible cargar las cotizaciones.";

export function useCotizaciones() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [params, setParams] = useState<CotizacionesQueryParams>({
    page: 1,
    page_size: DEFAULT_PAGE_SIZE,
    ordering: "-fecha_creacion",
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadCotizaciones = async () => {
      try {
        const response = await cotizacionesApi.getCotizaciones(params);

        if (!isActive) {
          return;
        }

        setCotizaciones(response.results);
        setCount(response.count);
        setNext(response.next);
        setPrevious(response.previous);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, COTIZACIONES_ERROR_MESSAGE),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadCotizaciones();

    return () => {
      isActive = false;
    };
  }, [params, refreshKey]);

  const beginRequest = useCallback(() => {
    setIsLoading(true);
    setErrorMessage("");
  }, []);

  const setSearch = useCallback(
    (search: string) => {
      beginRequest();
      setParams((current) => ({
        ...current,
        page: 1,
        search: search.trim() || undefined,
      }));
    },
    [beginRequest],
  );

  const setEstado = useCallback(
    (estado: EstadoCotizacion | "") => {
      beginRequest();
      setParams((current) => ({
        ...current,
        page: 1,
        estado: estado || undefined,
      }));
    },
    [beginRequest],
  );

  const setTipo = useCallback(
    (tipo: TipoCotizacion | "") => {
      beginRequest();
      setParams((current) => ({
        ...current,
        page: 1,
        tipo: tipo || undefined,
      }));
    },
    [beginRequest],
  );

  const setPage = useCallback(
    (page: number) => {
      if (page < 1) {
        return;
      }

      beginRequest();
      setParams((current) => ({ ...current, page }));
    },
    [beginRequest],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      beginRequest();
      setParams((current) => ({
        ...current,
        page: 1,
        page_size: pageSize,
      }));
    },
    [beginRequest],
  );

  const clearFilters = useCallback(() => {
    beginRequest();
    setParams((current) => ({
      page: 1,
      page_size: current.page_size ?? DEFAULT_PAGE_SIZE,
      ordering: "-fecha_creacion",
    }));
  }, [beginRequest]);

  const reload = useCallback(() => {
    beginRequest();
    setRefreshKey((current) => current + 1);
  }, [beginRequest]);

  const currentPage = params.page ?? 1;
  const pageSize = params.page_size ?? DEFAULT_PAGE_SIZE;
  const totalPages = useMemo(
    () => Math.max(Math.ceil(count / pageSize), 1),
    [count, pageSize],
  );

  return {
    cotizaciones,
    count,
    next,
    previous,
    currentPage,
    pageSize,
    totalPages,
    search: params.search ?? "",
    estado: params.estado ?? "",
    tipo: params.tipo ?? "",
    isLoading,
    errorMessage,
    setSearch,
    setEstado,
    setTipo,
    setPage,
    setPageSize,
    clearFilters,
    reload,
  };
}
