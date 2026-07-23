import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ExternalLink,
  FileDown,
  FileSpreadsheet,
  FileText,
  FolderCog,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { contabilidadApi } from "../api/contabilidadApi";
import { usePermissions } from "../auth/usePermissions";
import { CategoriasGastoModal } from "../components/contabilidad/CategoriasGastoModal";
import { GastoDeleteModal } from "../components/contabilidad/GastoDeleteModal";
import { GastoFormModal } from "../components/contabilidad/GastoFormModal";
import { GastosTrashModal } from "../components/contabilidad/GastosTrashModal";
import { MetodoPagoBadge } from "../components/contabilidad/MetodoPagoBadge";
import { MovimientoTipoBadge } from "../components/contabilidad/MovimientoTipoBadge";
import {
  useCategoriasGasto,
  useLibroContable,
  useLibroOpciones,
} from "../hooks/useContabilidad";
import type {
  Gasto,
  LibroQueryParams,
  MetodoPagoGasto,
  OrdenLibro,
  TipoMovimientoLibro,
} from "../types/contabilidad";
import {
  downloadLibroFile,
  formatDate,
  getComprobanteUrl,
  getMetodoPagoLabel,
  toMoneyNumber,
} from "../utils/contabilidadUtils";
import { formatCurrency } from "../utils/formatCurrency";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

const metodos: MetodoPagoGasto[] = [
  "EFECTIVO",
  "TRANSFERENCIA",
  "TARJETA",
  "CHEQUE",
  "OTRO",
];

const emptyValue = "";

export function LibroPage() {
  const { canManage } = usePermissions();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [tipo, setTipo] = useState<TipoMovimientoLibro | "">(emptyValue);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [proyectoId, setProyectoId] = useState("");
  const [cotizacionId, setCotizacionId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPagoGasto | "">("");
  const [ordering, setOrdering] = useState<OrdenLibro>("-fecha");
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [deletingGasto, setDeletingGasto] = useState<Gasto | null>(null);
  const [loadingGastoId, setLoadingGastoId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [exporting, setExporting] = useState<"excel" | "csv" | null>(null);
  const [actionError, setActionError] = useState("");

  const categoriasResult = useCategoriasGasto();
  const opcionesResult = useLibroOpciones();

  const libroResult = useLibroContable({
    page,
    page_size: pageSize,
    search: deferredSearch || undefined,
    tipo: tipo || undefined,
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
    cliente: clienteId ? Number(clienteId) : undefined,
    proyecto: proyectoId ? Number(proyectoId) : undefined,
    cotizacion: cotizacionId ? Number(cotizacionId) : undefined,
    categoria: categoriaId ? Number(categoriaId) : undefined,
    metodo_pago: metodoPago || undefined,
    ordering,
  });

  const proyectosFiltrados = useMemo(() => {
    if (!clienteId) return opcionesResult.proyectos;
    const selectedClientId = Number(clienteId);
    return opcionesResult.proyectos.filter(
      (proyecto) => proyecto.cliente === selectedClientId,
    );
  }, [clienteId, opcionesResult.proyectos]);

  const cotizacionesFiltradas = useMemo(() => {
    return opcionesResult.cotizaciones.filter((cotizacion) => {
      if (clienteId && cotizacion.cliente !== Number(clienteId)) return false;
      if (proyectoId && cotizacion.proyecto !== Number(proyectoId)) return false;
      return true;
    });
  }, [clienteId, opcionesResult.cotizaciones, proyectoId]);

  const pageTotal = useMemo(
    () =>
      libroResult.movimientos.reduce(
        (total, movimiento) => total + toMoneyNumber(movimiento.monto),
        0,
      ),
    [libroResult.movimientos],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(libroResult.count / Math.max(pageSize, 1)),
  );

  const exportParams: Omit<LibroQueryParams, "page" | "page_size"> = {
    search: deferredSearch || undefined,
    tipo: tipo || undefined,
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
    cliente: clienteId ? Number(clienteId) : undefined,
    proyecto: proyectoId ? Number(proyectoId) : undefined,
    cotizacion: cotizacionId ? Number(cotizacionId) : undefined,
    categoria: categoriaId ? Number(categoriaId) : undefined,
    metodo_pago: metodoPago || undefined,
    ordering,
  };

  const reloadAll = () => {
    libroResult.reload();
  };

  const clearFilters = () => {
    setSearch("");
    setTipo("");
    setFechaDesde("");
    setFechaHasta("");
    setClienteId("");
    setProyectoId("");
    setCotizacionId("");
    setCategoriaId("");
    setMetodoPago("");
    setOrdering("-fecha");
    setPage(1);
  };

  const handleClienteChange = (value: string) => {
    setClienteId(value);
    setProyectoId("");
    setCotizacionId("");
    setPage(1);
  };

  const handleProyectoChange = (value: string) => {
    setProyectoId(value);
    setCotizacionId("");
    setPage(1);
  };

  const handleExport = async (format: "excel" | "csv") => {
    try {
      setExporting(format);
      setActionError("");
      const download =
        format === "excel"
          ? await contabilidadApi.exportLibroExcel(exportParams)
          : await contabilidadApi.exportLibroCsv(exportParams);
      downloadLibroFile(download);
    } catch (error) {
      setActionError(
        getApiErrorMessage(
          error,
          `No fue posible exportar el libro en ${format.toUpperCase()}.`,
        ),
      );
    } finally {
      setExporting(null);
    }
  };

  const loadGastoForAction = async (
    gastoId: number,
    action: "edit" | "delete",
  ) => {
    try {
      setLoadingGastoId(gastoId);
      setActionError("");
      const gasto = await contabilidadApi.getGasto(gastoId);
      if (action === "edit") setEditingGasto(gasto);
      else setDeletingGasto(gasto);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "No fue posible consultar el gasto."),
      );
    } finally {
      setLoadingGastoId(null);
    }
  };

  const combinedError =
    actionError ||
    libroResult.errorMessage ||
    categoriasResult.errorMessage ||
    opcionesResult.errorMessage;

  const utilidad = toMoneyNumber(libroResult.resumen.utilidad);
  const ivaNeto = toMoneyNumber(libroResult.resumen.iva_neto);

  return (
    <div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">
            Libro contable
          </h2>
          <p className="text-slate-500">
            Ingresos, gastos, utilidad e IVA con filtros y exportación real.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleExport("excel")}
            disabled={exporting !== null}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
          >
            <FileSpreadsheet size={18} />
            {exporting === "excel" ? "Generando..." : "Exportar Excel"}
          </button>
          <button
            type="button"
            onClick={() => void handleExport("csv")}
            disabled={exporting !== null}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <FileDown size={18} />
            {exporting === "csv" ? "Generando..." : "Exportar CSV"}
          </button>
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => setIsCategoriesOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-600 hover:bg-slate-50"
              >
                <FolderCog size={18} /> Categorías
              </button>
              <button
                type="button"
                onClick={() => setIsTrashOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-600 hover:bg-slate-50"
              >
                <Trash2 size={18} /> Papelera
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white shadow-sm hover:bg-[#FF9A3D]"
              >
                <Plus size={18} /> Registrar gasto
              </button>
            </>
          )}
        </div>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-2xl bg-[#17445A] p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white/75">Ingresos</p>
            <TrendingUp size={21} className="text-white/70" />
          </div>
          <h3 className="mt-2 text-2xl font-black">
            {formatCurrency(toMoneyNumber(libroResult.resumen.ingresos))}
          </h3>
          <p className="mt-2 text-xs text-white/70">
            {libroResult.resumen.ingresos_count} pago(s)
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#255F7A]">Gastos</p>
            <TrendingDown size={21} className="text-red-500" />
          </div>
          <h3 className="mt-2 text-2xl font-black text-red-600">
            {formatCurrency(toMoneyNumber(libroResult.resumen.gastos))}
          </h3>
          <p className="mt-2 text-xs text-slate-500">
            {libroResult.resumen.gastos_count} gasto(s)
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#255F7A]">Utilidad</p>
            <WalletCards size={21} className="text-green-600" />
          </div>
          <h3
            className={`mt-2 text-2xl font-black ${
              utilidad >= 0 ? "text-green-700" : "text-red-600"
            }`}
          >
            {formatCurrency(utilidad)}
          </h3>
          <p className="mt-2 text-xs text-slate-500">
            Ingresos menos gastos
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#255F7A]">IVA neto</p>
            <BookOpen size={21} className="text-[#F5822A]" />
          </div>
          <h3
            className={`mt-2 text-2xl font-black ${
              ivaNeto >= 0 ? "text-[#17445A]" : "text-red-600"
            }`}
          >
            {formatCurrency(ivaNeto)}
          </h3>
          <p className="mt-2 text-xs text-slate-500">
            Cobrado menos acreditable
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#255F7A]">Movimientos</p>
            <FileText size={21} className="text-[#255F7A]" />
          </div>
          <h3 className="mt-2 text-2xl font-black text-[#17445A]">
            {libroResult.resumen.movimientos}
          </h3>
          <p className="mt-2 text-xs text-slate-500">
            Con los filtros actuales
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_180px_180px_180px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar cliente, proyecto, cotización, factura, proveedor..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-[#F5822A]"
            />
          </div>

          <select
            value={tipo}
            onChange={(event) => {
              setTipo(event.target.value as TipoMovimientoLibro | "");
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
          >
            <option value="">Ingresos y gastos</option>
            <option value="INGRESO">Solo ingresos</option>
            <option value="GASTO">Solo gastos</option>
          </select>

          <input
            type="date"
            value={fechaDesde}
            max={fechaHasta || undefined}
            onChange={(event) => {
              setFechaDesde(event.target.value);
              setPage(1);
            }}
            aria-label="Fecha desde"
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
          />

          <input
            type="date"
            value={fechaHasta}
            min={fechaDesde || undefined}
            onChange={(event) => {
              setFechaHasta(event.target.value);
              setPage(1);
            }}
            aria-label="Fecha hasta"
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <select
            value={clienteId}
            onChange={(event) => handleClienteChange(event.target.value)}
            disabled={opcionesResult.isLoading}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A] disabled:bg-slate-50"
          >
            <option value="">Todos los clientes</option>
            {opcionesResult.clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.empresa || cliente.nombre_solicitante}
              </option>
            ))}
          </select>

          <select
            value={proyectoId}
            onChange={(event) => handleProyectoChange(event.target.value)}
            disabled={opcionesResult.isLoading}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A] disabled:bg-slate-50"
          >
            <option value="">Todos los proyectos</option>
            {proyectosFiltrados.map((proyecto) => (
              <option key={proyecto.id} value={proyecto.id}>
                {proyecto.nombre}
              </option>
            ))}
          </select>

          <select
            value={cotizacionId}
            onChange={(event) => {
              setCotizacionId(event.target.value);
              setPage(1);
            }}
            disabled={opcionesResult.isLoading}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A] disabled:bg-slate-50"
          >
            <option value="">Todas las cotizaciones</option>
            {cotizacionesFiltradas.map((cotizacion) => (
              <option key={cotizacion.id} value={cotizacion.id}>
                {cotizacion.codigo} · {cotizacion.cliente_nombre}
              </option>
            ))}
          </select>

          <select
            value={categoriaId}
            onChange={(event) => {
              setCategoriaId(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
          >
            <option value="">Todas las categorías</option>
            {categoriasResult.categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
                {!categoria.activo ? " (inactiva)" : ""}
              </option>
            ))}
          </select>

          <select
            value={metodoPago}
            onChange={(event) => {
              setMetodoPago(event.target.value as MetodoPagoGasto | "");
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
          >
            <option value="">Todos los métodos de pago</option>
            {metodos.map((metodo) => (
              <option key={metodo} value={metodo}>
                {getMetodoPagoLabel(metodo)}
              </option>
            ))}
          </select>

          <select
            value={ordering}
            onChange={(event) => {
              setOrdering(event.target.value as OrdenLibro);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
          >
            <option value="-fecha">Más recientes primero</option>
            <option value="fecha">Más antiguos primero</option>
            <option value="-monto">Mayor importe primero</option>
            <option value="monto">Menor importe primero</option>
          </select>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">
            {libroResult.count} movimiento(s) con los filtros actuales.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={libroResult.reload}
              className="inline-flex items-center gap-2 text-sm font-black text-[#255F7A] hover:text-[#F5822A]"
            >
              <RefreshCw size={15} /> Actualizar
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-black text-[#255F7A] hover:text-[#F5822A]"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </section>

      {combinedError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
          {combinedError}
        </div>
      )}

      {libroResult.isLoading ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center font-semibold text-slate-500 shadow-sm">
          Cargando libro contable...
        </section>
      ) : libroResult.movimientos.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <FileText size={38} className="mx-auto text-slate-300" />
          <h3 className="mt-3 text-xl font-black text-[#17445A]">
            No hay movimientos
          </h3>
          <p className="mt-2 text-slate-500">
            Registra pagos o gastos, o cambia los filtros actuales.
          </p>
        </section>
      ) : (
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-[#17445A]">
                Movimientos contables
              </h3>
              <p className="text-sm text-slate-500">
                Ingresos provenientes de cobranza y gastos activos.
              </p>
            </div>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-600"
            >
              <option value={10}>10 por página</option>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] text-sm">
              <thead className="bg-[#E8F1F5] text-[#17445A]">
                <tr>
                  <th className="p-4 text-left">Fecha</th>
                  <th className="p-4 text-left">Tipo</th>
                  <th className="p-4 text-left">Concepto</th>
                  <th className="p-4 text-left">Relación</th>
                  <th className="p-4 text-left">Método</th>
                  <th className="p-4 text-right">Subtotal</th>
                  <th className="p-4 text-right">IVA</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Archivo</th>
                  {canManage && <th className="p-4 text-center">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {libroResult.movimientos.map((movimiento) => (
                  <tr
                    key={movimiento.id}
                    className="border-t border-slate-100 align-top transition hover:bg-slate-50"
                  >
                    <td className="p-4 font-semibold text-slate-600">
                      {formatDate(movimiento.fecha)}
                    </td>
                    <td className="p-4">
                      <MovimientoTipoBadge tipo={movimiento.tipo} />
                    </td>
                    <td className="p-4">
                      <p className="font-black text-[#17445A]">
                        {movimiento.concepto}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {movimiento.tipo === "GASTO"
                          ? movimiento.proveedor || movimiento.categoria_nombre
                          : movimiento.factura_folio
                            ? `Factura ${movimiento.factura_folio}`
                            : movimiento.categoria_nombre}
                      </p>
                      {movimiento.notas && (
                        <p className="mt-1 max-w-xs text-xs text-slate-400">
                          {movimiento.notas}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 text-xs">
                        <p className="font-bold text-slate-700">
                          {movimiento.cliente_nombre || "Sin cliente"}
                        </p>
                        {movimiento.proyecto_id && (
                          <Link
                            to={`/proyectos/${movimiento.proyecto_id}`}
                            className="block font-bold text-[#255F7A] hover:text-[#F5822A]"
                          >
                            {movimiento.proyecto_nombre}
                          </Link>
                        )}
                        {movimiento.cotizacion_id && (
                          <Link
                            to={`/cotizaciones/${movimiento.cotizacion_id}`}
                            className="block font-bold text-[#255F7A] hover:text-[#F5822A]"
                          >
                            {movimiento.cotizacion_codigo}
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <MetodoPagoBadge metodo={movimiento.metodo_pago} />
                      <p className="mt-2 max-w-[180px] text-xs text-slate-500">
                        {movimiento.referencia || "Sin referencia"}
                      </p>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-600">
                      {formatCurrency(toMoneyNumber(movimiento.subtotal))}
                    </td>
                    <td className="p-4 text-right font-bold text-slate-600">
                      {formatCurrency(toMoneyNumber(movimiento.iva))}
                    </td>
                    <td
                      className={`p-4 text-right font-black ${
                        movimiento.tipo === "INGRESO"
                          ? "text-green-700"
                          : "text-red-600"
                      }`}
                    >
                      {movimiento.tipo === "INGRESO" ? "+" : "−"}
                      {formatCurrency(toMoneyNumber(movimiento.monto))}
                    </td>
                    <td className="p-4 text-center">
                      {movimiento.comprobante ? (
                        <a
                          href={getComprobanteUrl(movimiento.comprobante)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl bg-[#E8F1F5] px-3 py-2 text-xs font-black text-[#255F7A] hover:bg-blue-100"
                        >
                          <ExternalLink size={14} /> Ver
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    {canManage && (
                      <td className="p-4">
                        {movimiento.tipo === "GASTO" ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                void loadGastoForAction(
                                  movimiento.registro_id,
                                  "edit",
                                )
                              }
                              disabled={loadingGastoId === movimiento.registro_id}
                              className="rounded-xl bg-[#255F7A] p-2 text-white hover:bg-[#17445A] disabled:opacity-50"
                              aria-label="Editar gasto"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                void loadGastoForAction(
                                  movimiento.registro_id,
                                  "delete",
                                )
                              }
                              disabled={loadingGastoId === movimiento.registro_id}
                              className="rounded-xl bg-red-100 p-2 text-red-600 hover:bg-red-200 disabled:opacity-50"
                              aria-label="Eliminar gasto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="block text-center text-xs text-slate-400">
                            Se administra en Cobranza
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <td
                    colSpan={7}
                    className="p-4 text-right font-black text-[#17445A]"
                  >
                    Suma absoluta de esta página
                  </td>
                  <td className="p-4 text-right font-black text-[#17445A]">
                    {formatCurrency(pageTotal)}
                  </td>
                  <td />
                  {canManage && <td />}
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-500">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={!libroResult.previous || libroResult.isLoading}
                className="rounded-xl border border-slate-300 p-2 text-slate-600 disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!libroResult.next || libroResult.isLoading}
                className="rounded-xl border border-slate-300 p-2 text-slate-600 disabled:opacity-40"
                aria-label="Página siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </section>
      )}

      {canManage && isFormOpen && (
        <GastoFormModal
          categorias={categoriasResult.categorias}
          proyectos={opcionesResult.proyectos}
          cotizaciones={opcionesResult.cotizaciones}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => {
            setIsFormOpen(false);
            reloadAll();
          }}
        />
      )}

      {canManage && editingGasto && (
        <GastoFormModal
          categorias={categoriasResult.categorias}
          proyectos={opcionesResult.proyectos}
          cotizaciones={opcionesResult.cotizaciones}
          gasto={editingGasto}
          onClose={() => setEditingGasto(null)}
          onSaved={() => {
            setEditingGasto(null);
            reloadAll();
          }}
        />
      )}

      {canManage && deletingGasto && (
        <GastoDeleteModal
          gasto={deletingGasto}
          onClose={() => setDeletingGasto(null)}
          onDeleted={() => {
            setDeletingGasto(null);
            reloadAll();
          }}
        />
      )}

      {canManage && isTrashOpen && (
        <GastosTrashModal
          onClose={() => setIsTrashOpen(false)}
          onRestored={reloadAll}
        />
      )}

      {canManage && isCategoriesOpen && (
        <CategoriasGastoModal
          onClose={() => setIsCategoriesOpen(false)}
          onChanged={categoriasResult.reload}
        />
      )}
    </div>
  );
}
