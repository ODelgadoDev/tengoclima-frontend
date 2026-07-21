import { useCallback, useEffect, useMemo, useState } from "react";
import { proyectosApi } from "../api/proyectosApi";
import type {
  EstadoProyecto,
  Proyecto,
  ProyectosQueryParams,
} from "../types/proyecto";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const DEFAULT_PAGE_SIZE = 10;
const PROYECTOS_ERROR_MESSAGE = "No fue posible cargar los proyectos.";

export function useProyectos() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [params, setParams] = useState<ProyectosQueryParams>({
    page: 1,
    page_size: DEFAULT_PAGE_SIZE,
    ordering: "-fecha_creacion",
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadProyectos = async () => {
      try {
        const response = await proyectosApi.getProyectos(params);

        if (!isActive) {
          return;
        }

        setProyectos(response.results);
        setCount(response.count);
        setNext(response.next);
        setPrevious(response.previous);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, PROYECTOS_ERROR_MESSAGE),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadProyectos();

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
    (estado: EstadoProyecto | "") => {
      beginRequest();
      setParams((current) => ({
        ...current,
        page: 1,
        estado: estado || undefined,
      }));
    },
    [beginRequest],
  );

  const setResponsable = useCallback(
    (responsable: number | null) => {
      beginRequest();
      setParams((current) => ({
        ...current,
        page: 1,
        responsable: responsable ?? undefined,
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
    proyectos,
    count,
    next,
    previous,
    currentPage,
    pageSize,
    totalPages,
    search: params.search ?? "",
    estado: params.estado ?? "",
    responsable: params.responsable ?? null,
    isLoading,
    errorMessage,
    setSearch,
    setEstado,
    setResponsable,
    setPage,
    setPageSize,
    clearFilters,
    reload,
  };
}
