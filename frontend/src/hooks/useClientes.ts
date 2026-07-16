import { useCallback, useEffect, useState } from "react";

import { clientesApi } from "../api/clientesApi";
import type {
  Cliente,
  ClientesQueryParams,
} from "../types/client";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const CLIENTES_ERROR_MESSAGE =
  "No fue posible cargar los clientes.";

export function useClientes(
  initialParams: ClientesQueryParams = {},
) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadInitialClientes = async () => {
      try {
        const response = await clientesApi.getClientes(initialParams);

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

    void loadInitialClientes();

    return () => {
      isActive = false;
    };
  }, []);

  const reload = useCallback(
    async (params: ClientesQueryParams = initialParams) => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const response = await clientesApi.getClientes(params);

        setClientes(response.results);
        setCount(response.count);
        setNext(response.next);
        setPrevious(response.previous);
      } catch (error) {
        setErrorMessage(
          getApiErrorMessage(error, CLIENTES_ERROR_MESSAGE),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    clientes,
    count,
    next,
    previous,
    isLoading,
    errorMessage,
    reload,
  };
}