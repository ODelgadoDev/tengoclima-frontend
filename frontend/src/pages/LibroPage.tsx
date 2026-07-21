import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  FolderCog,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { contabilidadApi } from "../api/contabilidadApi";
import { usePermissions } from "../auth/usePermissions";
import { CategoriasGastoModal } from "../components/contabilidad/CategoriasGastoModal";
import { GastoDeleteModal } from "../components/contabilidad/GastoDeleteModal";
import { GastoFormModal } from "../components/contabilidad/GastoFormModal";
import { GastosTrashModal } from "../components/contabilidad/GastosTrashModal";
import { MetodoPagoBadge } from "../components/contabilidad/MetodoPagoBadge";
import {
  useCategoriasGasto,
  useFinanzasContabilidad,
  useGastos,
} from "../hooks/useContabilidad";
import type {
  Gasto,
  GastosQueryParams,
  MetodoPagoGasto,
} from "../types/contabilidad";
import {
  downloadGastosCsv,
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

export function LibroPage() {
  const { canManage } = usePermissions();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [categoriaId, setCategoriaId] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPagoGasto | "">("");
  const [fechaGasto, setFechaGasto] = useState("");
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const [deletingGasto, setDeletingGasto] = useState<Gasto | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [actionError, setActionError] = useState("");

  const categoriasResult = useCategoriasGasto();
  const finanzasResult = useFinanzasContabilidad();
  const gastosResult = useGastos({
    page,
    page_size: pageSize,
    search: deferredSearch || undefined,
    categoria: categoriaId ? Number(categoriaId) : undefined,
    metodo_pago: metodoPago || undefined,
    fecha_gasto: fechaGasto || undefined,
    ordering: "-fecha_gasto",
  });

  const visibleTotal = useMemo(
    () =>
      gastosResult.gastos.reduce(
        (total, gasto) => total + toMoneyNumber(gasto.monto),
        0,
      ),
    [gastosResult.gastos],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(gastosResult.count / Math.max(pageSize, 1)),
  );

  const exportParams: Omit<GastosQueryParams, "page" | "page_size"> = {
    search: deferredSearch || undefined,
    categoria: categoriaId ? Number(categoriaId) : undefined,
    metodo_pago: metodoPago || undefined,
    fecha_gasto: fechaGasto || undefined,
    ordering: "-fecha_gasto",
  };

  const reloadAll = () => {
    gastosResult.reload();
    finanzasResult.reload();
  };

  const clearFilters = () => {
    setSearch("");
    setCategoriaId("");
    setMetodoPago("");
    setFechaGasto("");
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setActionError("");
      const gastos = await contabilidadApi.getAllGastos(exportParams);
      if (gastos.length === 0) {
        setActionError("No hay gastos para exportar con los filtros actuales.");
        return;
      }
      downloadGastosCsv(gastos);
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, "No fue posible exportar los gastos."),
      );
    } finally {
      setIsExporting(false);
    }
  };

  const combinedError =
    actionError ||
    gastosResult.errorMessage ||
    categoriasResult.errorMessage ||
    finanzasResult.errorMessage;

  return (
    <div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">Libro</h2>
          <p className="text-slate-500">
            Registro real de gastos, comprobantes y resultado financiero.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <Download size={18} />
            {isExporting ? "Exportando..." : "Exportar CSV"}
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

      <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl bg-[#17445A] p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-white/75">Monto cobrado</p>
            <TrendingUp size={22} className="text-white/70" />
          </div>
          <h3 className="mt-2 text-3xl font-black">
            {finanzasResult.isLoading
              ? "—"
              : formatCurrency(finanzasResult.finanzas.monto_cobrado)}
          </h3>
          <p className="mt-2 text-sm text-white/75">Ingresos registrados.</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#255F7A]">Total de gastos</p>
            <TrendingDown size={22} className="text-red-500" />
          </div>
          <h3 className="mt-2 text-3xl font-black text-red-600">
            {finanzasResult.isLoading
              ? "—"
              : formatCurrency(finanzasResult.finanzas.total_gastos)}
          </h3>
          <p className="mt-2 text-sm text-slate-500">Egresos activos acumulados.</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#255F7A]">Utilidad actual</p>
            <WalletCards size={22} className="text-green-600" />
          </div>
          <h3
            className={`mt-2 text-3xl font-black ${
              finanzasResult.finanzas.utilidad >= 0
                ? "text-green-700"
                : "text-red-600"
            }`}
          >
            {finanzasResult.isLoading
              ? "—"
              : formatCurrency(finanzasResult.finanzas.utilidad)}
          </h3>
          <p className="mt-2 text-sm text-slate-500">Cobrado menos gastos.</p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-[#255F7A]">Registros</p>
            <BookOpen size={22} className="text-[#F5822A]" />
          </div>
          <h3 className="mt-2 text-3xl font-black text-[#17445A]">
            {gastosResult.count}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Página actual: {formatCurrency(visibleTotal)}
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_220px_190px]">
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
              placeholder="Buscar concepto, proveedor, categoría o notas..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-[#F5822A]"
            />
          </div>

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
            <option value="">Todos los métodos</option>
            {metodos.map((metodo) => (
              <option key={metodo} value={metodo}>
                {getMetodoPagoLabel(metodo)}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={fechaGasto}
            onChange={(event) => {
              setFechaGasto(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-500">
            {gastosResult.count} gasto(s) con los filtros actuales.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-black text-[#255F7A] hover:text-[#F5822A]"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      {combinedError && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
          {combinedError}
        </div>
      )}

      {gastosResult.isLoading ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center font-semibold text-slate-500 shadow-sm">
          Cargando libro contable...
        </section>
      ) : gastosResult.gastos.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <FileText size={38} className="mx-auto text-slate-300" />
          <h3 className="mt-3 text-xl font-black text-[#17445A]">
            No hay gastos registrados
          </h3>
          <p className="mt-2 text-slate-500">
            Registra el primer gasto o cambia los filtros actuales.
          </p>
        </section>
      ) : (
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-[#17445A]">
                Registro de gastos
              </h3>
              <p className="text-sm text-slate-500">
                Los comprobantes se almacenan en el backend.
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
            <table className="w-full text-sm">
              <thead className="bg-[#E8F1F5] text-[#17445A]">
                <tr>
                  <th className="p-4 text-left">Fecha</th>
                  <th className="p-4 text-left">Categoría</th>
                  <th className="p-4 text-left">Concepto / Proveedor</th>
                  <th className="p-4 text-left">Método</th>
                  <th className="p-4 text-center">Comprobante</th>
                  <th className="p-4 text-right">Monto</th>
                  {canManage && (
                    <th className="p-4 text-center">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {gastosResult.gastos.map((gasto) => (
                  <tr
                    key={gasto.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="p-4 font-semibold text-slate-600">
                      {formatDate(gasto.fecha_gasto)}
                    </td>
                    <td className="p-4 font-bold text-[#17445A]">
                      {gasto.categoria_nombre ?? "Sin categoría"}
                    </td>
                    <td className="p-4">
                      <p className="font-black text-[#17445A]">{gasto.concepto}</p>
                      <p className="text-slate-500">{gasto.proveedor ?? "—"}</p>
                    </td>
                    <td className="p-4">
                      <MetodoPagoBadge metodo={gasto.metodo_pago} />
                    </td>
                    <td className="p-4 text-center">
                      {gasto.comprobante ? (
                        <a
                          href={getComprobanteUrl(gasto.comprobante)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl bg-[#E8F1F5] px-3 py-2 text-xs font-black text-[#255F7A] hover:bg-blue-100"
                        >
                          <ExternalLink size={14} /> Ver
                        </a>
                      ) : (
                        <span className="text-slate-400">Sin archivo</span>
                      )}
                    </td>
                    <td className="p-4 text-right font-black text-red-600">
                      {formatCurrency(toMoneyNumber(gasto.monto))}
                    </td>
                    {canManage && (
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingGasto(gasto)}
                            className="rounded-xl bg-[#255F7A] p-2 text-white hover:bg-[#17445A]"
                            aria-label="Editar gasto"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingGasto(gasto)}
                            className="rounded-xl bg-red-100 p-2 text-red-600 hover:bg-red-200"
                            aria-label="Eliminar gasto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-slate-200 bg-slate-50">
                <tr>
                  <td
                    colSpan={canManage ? 5 : 4}
                    className="p-4 text-right font-black text-[#17445A]"
                  >
                    Total de esta página
                  </td>
                  <td className="p-4 text-right font-black text-red-600">
                    {formatCurrency(visibleTotal)}
                  </td>
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
                disabled={!gastosResult.previous || gastosResult.isLoading}
                className="rounded-xl border border-slate-300 p-2 text-slate-600 disabled:opacity-40"
                aria-label="Página anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={!gastosResult.next || gastosResult.isLoading}
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
