import { useCallback, useEffect, useState } from "react";
import { clientesApi } from "../api/clientesApi";
import { contabilidadApi } from "../api/contabilidadApi";
import { cotizacionesApi } from "../api/cotizacionesApi";
import { dashboardApi } from "../api/dashboardApi";
import { proyectosApi } from "../api/proyectosApi";
import type { Cliente } from "../types/client";
import type {
  CategoriaGasto,
  Gasto,
  GastosQueryParams,
  LibroMovimiento,
  LibroQueryParams,
  LibroResumen,
} from "../types/contabilidad";
import type { Cotizacion } from "../types/cotizacion";
import type { DashboardFinanzas } from "../types/dashboard";
import type { Proyecto } from "../types/proyecto";
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
    proyecto,
    cotizacion,
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
          proyecto,
          cotizacion,
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
    cotizacion,
    fecha_gasto,
    metodo_pago,
    ordering,
    page,
    page_size,
    proyecto,
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
  monto_facturado: 0,
  monto_pendiente_facturar: 0,
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

const emptyLibroResumen: LibroResumen = {
  ingresos: "0.00",
  gastos: "0.00",
  utilidad: "0.00",
  iva_ingresos: "0.00",
  iva_gastos: "0.00",
  iva_neto: "0.00",
  movimientos: 0,
  ingresos_count: 0,
  gastos_count: 0,
};

type UseLibroParams = Required<Pick<LibroQueryParams, "page" | "page_size">> &
  Omit<LibroQueryParams, "page" | "page_size">;

export function useLibroContable(params: UseLibroParams) {
  const [movimientos, setMovimientos] = useState<LibroMovimiento[]>([]);
  const [resumen, setResumen] = useState<LibroResumen>(emptyLibroResumen);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    page,
    page_size,
    fecha_desde,
    fecha_hasta,
    tipo,
    cliente,
    proyecto,
    cotizacion,
    categoria,
    metodo_pago,
    search,
    ordering,
  } = params;

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const response = await contabilidadApi.getLibro({
          page,
          page_size,
          fecha_desde,
          fecha_hasta,
          tipo,
          cliente,
          proyecto,
          cotizacion,
          categoria,
          metodo_pago,
          search,
          ordering,
        });
        if (!isActive) return;
        setMovimientos(response.results);
        setResumen(response.resumen);
        setCount(response.count);
        setNext(response.next);
        setPrevious(response.previous);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(
          getApiErrorMessage(
            error,
            "No fue posible cargar el libro contable.",
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
  }, [
    categoria,
    cliente,
    cotizacion,
    fecha_desde,
    fecha_hasta,
    metodo_pago,
    ordering,
    page,
    page_size,
    proyecto,
    refreshKey,
    search,
    tipo,
  ]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setErrorMessage("");
    setRefreshKey((current) => current + 1);
  }, []);

  return {
    movimientos,
    resumen,
    count,
    next,
    previous,
    isLoading,
    errorMessage,
    reload,
  };
}

async function loadAllClientes(): Promise<Cliente[]> {
  const items: Cliente[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const response = await clientesApi.getClientes({
      page,
      page_size: 100,
      ordering: "empresa",
    });
    items.push(...response.results);
    hasNext = Boolean(response.next);
    page += 1;
  }

  return items;
}

async function loadAllProyectos(): Promise<Proyecto[]> {
  const items: Proyecto[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const response = await proyectosApi.getProyectos({
      page,
      page_size: 100,
      ordering: "nombre",
    });
    items.push(...response.results);
    hasNext = Boolean(response.next);
    page += 1;
  }

  return items;
}

async function loadAllCotizaciones(): Promise<Cotizacion[]> {
  const items: Cotizacion[] = [];
  let page = 1;
  let hasNext = true;

  while (hasNext) {
    const response = await cotizacionesApi.getCotizaciones({
      page,
      page_size: 100,
      ordering: "codigo",
    });
    items.push(...response.results);
    hasNext = Boolean(response.next);
    page += 1;
  }

  return items;
}

export function useLibroOpciones() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const [clientesResult, proyectosResult, cotizacionesResult] =
          await Promise.all([
            loadAllClientes(),
            loadAllProyectos(),
            loadAllCotizaciones(),
          ]);

        if (!isActive) return;
        setClientes(clientesResult);
        setProyectos(proyectosResult);
        setCotizaciones(cotizacionesResult);
        setErrorMessage("");
      } catch (error) {
        if (!isActive) return;
        setErrorMessage(
          getApiErrorMessage(
            error,
            "No fue posible cargar clientes, proyectos y cotizaciones.",
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

  return {
    clientes,
    proyectos,
    cotizaciones,
    isLoading,
    errorMessage,
    reload,
  };
}
