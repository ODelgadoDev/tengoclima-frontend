import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { clientesApi } from "../api/clientesApi";
import type { Cliente, ClientesQueryParams } from "../types/client";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const CLIENTES_ERROR_MESSAGE =
  "No fue posible cargar los clientes.";

const DEFAULT_PAGE_SIZE = 10;

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);

  const [params, setParams] = useState<ClientesQueryParams>({
    page: 1,
    page_size: DEFAULT_PAGE_SIZE,
    ordering: "-fecha_creacion",
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadClientes = async () => {
      try {
        const response = await clientesApi.getClientes(params);

        if (!isActive) {
          return;
        }

        setClientes(response.results);
        setCount(response.count);
        setNext(response.next);
        setPrevious(response.previous);
      } catch (error) {
        if (!isActive) {
          return;
        }

        setErrorMessage(
          getApiErrorMessage(error, CLIENTES_ERROR_MESSAGE),
        );
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadClientes();

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

      setParams((currentParams) => ({
        ...currentParams,
        page: 1,
        search: search.trim() || undefined,
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

      setParams((currentParams) => ({
        ...currentParams,
        page,
      }));
    },
    [beginRequest],
  );

  const setPageSize = useCallback(
    (pageSize: number) => {
      beginRequest();

      setParams((currentParams) => ({
        ...currentParams,
        page: 1,
        page_size: pageSize,
      }));
    },
    [beginRequest],
  );

  const clearFilters = useCallback(() => {
    beginRequest();

    setParams((currentParams) => ({
      page: 1,
      page_size: currentParams.page_size ?? DEFAULT_PAGE_SIZE,
      ordering: "-fecha_creacion",
    }));
  }, [beginRequest]);

  const reload = useCallback(() => {
    beginRequest();
    setRefreshKey((currentKey) => currentKey + 1);
  }, [beginRequest]);

  const currentPage = params.page ?? 1;
  const pageSize = params.page_size ?? DEFAULT_PAGE_SIZE;

  const totalPages = useMemo(() => {
    return Math.max(Math.ceil(count / pageSize), 1);
  }, [count, pageSize]);

  return {
    clientes,
    count,
    next,
    previous,
    currentPage,
    pageSize,
    totalPages,
    search: params.search ?? "",
    isLoading,
    errorMessage,
    setSearch,
    setPage,
    setPageSize,
    clearFilters,
    reload,
  };
}
