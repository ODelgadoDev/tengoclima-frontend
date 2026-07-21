import { useMemo, useState } from "react";
import {
  CreditCard,
  Eye,
  History,
  ReceiptText,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { CobranzaStatusBadge } from "../components/cobranza/CobranzaStatusBadge";
import { PagoFormModal } from "../components/cobranza/PagoFormModal";
import { PagosHistoryModal } from "../components/cobranza/PagosHistoryModal";
import { PagosTrashModal } from "../components/cobranza/PagosTrashModal";
import { useCuentasPorCobrar } from "../hooks/useCobranza";
import type {
  CuentaCobranzaResumen,
  EstadoCobranza,
} from "../types/cobranza";
import { formatCurrency } from "../utils/formatCurrency";

export function CobrosPage() {
  const { cuentas, isLoading, errorMessage, reload } = useCuentasPorCobrar();
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<EstadoCobranza | "">("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [initialCotizacionId, setInitialCotizacionId] = useState<number | undefined>(undefined);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const totalPorCobrar = useMemo(
    () => cuentas.reduce((total, cuenta) => total + cuenta.pendiente, 0),
    [cuentas],
  );
  const totalPagado = useMemo(
    () => cuentas.reduce((total, cuenta) => total + cuenta.pagado, 0),
    [cuentas],
  );

  const filteredCuentas = useMemo(() => {
    const term = search.trim().toLowerCase();
    return cuentas.filter((cuenta) => {
      const matchesSearch =
        !term ||
        [cuenta.codigo, cuenta.cliente, cuenta.empresa].some((value) =>
          value.toLowerCase().includes(term),
        );
      const matchesEstado = !estado || cuenta.estado === estado;
      return matchesSearch && matchesEstado;
    });
  }, [cuentas, estado, search]);

  const historyCuenta = useMemo<CuentaCobranzaResumen | null>(() => {
    const cuenta = cuentas.find((item) => item.id === historyId);
    return cuenta ? { ...cuenta } : null;
  }, [cuentas, historyId]);

  const openCreate = (cotizacionId?: number) => {
    setInitialCotizacionId(cotizacionId);
    setIsFormOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">X Cobrar</h2>
          <p className="text-slate-500">
            Control real de cotizaciones con saldo pendiente y pagos.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsTrashOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold text-slate-600 hover:bg-slate-50"
          >
            <Trash2 size={18} /> Papelera
          </button>
          <button
            type="button"
            onClick={() => openCreate()}
            className="flex items-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#FF9A3D]"
          >
            <CreditCard size={18} /> Registrar pago
          </button>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <article className="rounded-2xl bg-[#17445A] p-6 text-white shadow-sm">
          <p className="text-sm font-bold text-white/75">Total por cobrar</p>
          <h3 className="mt-2 text-3xl font-black">
            {formatCurrency(totalPorCobrar)}
          </h3>
          <p className="mt-2 text-sm text-white/75">
            Suma de los saldos pendientes.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#255F7A]">Pagos recibidos</p>
          <h3 className="mt-2 text-3xl font-black text-[#17445A]">
            {formatCurrency(totalPagado)}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Abonos de las cuentas aún pendientes.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#255F7A]">Cuentas pendientes</p>
          <h3 className="mt-2 text-3xl font-black text-[#17445A]">
            {cuentas.length}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Cotizaciones con saldo mayor a cero.
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código, cliente o empresa..."
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-[#F5822A]"
            />
          </div>
          <select
            value={estado}
            onChange={(event) =>
              setEstado(event.target.value as EstadoCobranza | "")
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-[#F5822A]"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="PARCIAL">Pago parcial</option>
          </select>
        </div>
      </section>

      {errorMessage && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center font-semibold text-slate-500 shadow-sm">
          Cargando cuentas por cobrar...
        </section>
      ) : filteredCuentas.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h3 className="text-xl font-black text-[#17445A]">
            No hay saldos pendientes
          </h3>
          <p className="mt-2 text-slate-500">
            Las cotizaciones liquidadas aparecerán en Pagados.
          </p>
        </section>
      ) : (
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-black text-[#17445A]">
                Lista de cuentas por cobrar
              </h3>
              <p className="text-sm text-slate-500">
                Información calculada por el backend.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-[#E8F1F5] px-4 py-2 text-sm font-bold text-[#255F7A]">
              <ReceiptText size={17} /> Corte actual
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#E8F1F5] text-[#17445A]">
                <tr>
                  <th className="p-4 text-left">Código</th>
                  <th className="p-4 text-left">Cliente / Empresa</th>
                  <th className="p-4 text-left">Estado</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-right">Pagado</th>
                  <th className="p-4 text-right">Saldo</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCuentas.map((cuenta) => (
                  <tr
                    key={cuenta.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="p-4 font-black">
                      <Link
                        to={`/cotizaciones/${cuenta.id}`}
                        className="text-[#17445A] transition hover:text-[#F5822A]"
                      >
                        {cuenta.codigo}
                      </Link>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-[#17445A]">{cuenta.cliente}</p>
                      <p className="text-slate-500">{cuenta.empresa}</p>
                    </td>
                    <td className="p-4">
                      <CobranzaStatusBadge estado={cuenta.estado} />
                    </td>
                    <td className="p-4 text-right font-black text-[#17445A]">
                      {formatCurrency(cuenta.total)}
                    </td>
                    <td className="p-4 text-right font-black text-green-700">
                      {formatCurrency(cuenta.pagado)}
                    </td>
                    <td className="p-4 text-right font-black text-red-600">
                      {formatCurrency(cuenta.pendiente)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/cotizaciones/${cuenta.id}`}
                          className="rounded-xl bg-[#255F7A] p-2 text-white hover:bg-[#17445A]"
                          aria-label="Ver cotización"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setHistoryId(cuenta.id)}
                          className="rounded-xl bg-[#E8F1F5] p-2 text-[#255F7A] hover:bg-blue-100"
                          aria-label="Historial de pagos"
                        >
                          <History size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openCreate(cuenta.id)}
                          className="rounded-xl bg-[#F5822A] p-2 text-white hover:bg-[#FF9A3D]"
                          aria-label="Registrar pago"
                        >
                          <CreditCard size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {isFormOpen && (
        <PagoFormModal
          cuentas={cuentas}
          initialCotizacionId={initialCotizacionId}
          onClose={() => setIsFormOpen(false)}
          onSaved={() => {
            setIsFormOpen(false);
            reload();
          }}
        />
      )}

      {historyCuenta && (
        <PagosHistoryModal
          cuenta={historyCuenta}
          cuentasPorCobrar={cuentas}
          onClose={() => setHistoryId(null)}
          onChanged={reload}
        />
      )}

      {isTrashOpen && (
        <PagosTrashModal
          onClose={() => setIsTrashOpen(false)}
          onRestored={reload}
        />
      )}
    </div>
  );
}
