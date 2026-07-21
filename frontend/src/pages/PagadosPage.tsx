import { useMemo, useState } from "react";
import { CheckCircle2, Download, Eye, History, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { CobranzaStatusBadge } from "../components/cobranza/CobranzaStatusBadge";
import { PagosHistoryModal } from "../components/cobranza/PagosHistoryModal";
import { useCuentasPagadas, useCuentasPorCobrar } from "../hooks/useCobranza";
import type { CuentaCobranzaResumen } from "../types/cobranza";
import { escapeCsv } from "../utils/cobranzaUtils";
import { formatCurrency } from "../utils/formatCurrency";

export function PagadosPage() {
  const { cuentas, isLoading, errorMessage, reload } = useCuentasPagadas();
  const { cuentas: cuentasPorCobrar, reload: reloadPorCobrar } =
    useCuentasPorCobrar();
  const [search, setSearch] = useState("");
  const [historyId, setHistoryId] = useState<number | null>(null);

  const filteredCuentas = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return cuentas;
    return cuentas.filter((cuenta) =>
      [cuenta.codigo, cuenta.cliente, cuenta.empresa].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [cuentas, search]);

  const totalCobrado = useMemo(
    () => cuentas.reduce((total, cuenta) => total + cuenta.pagado, 0),
    [cuentas],
  );
  const totalFacturado = useMemo(
    () => cuentas.reduce((total, cuenta) => total + cuenta.total, 0),
    [cuentas],
  );

  const historyCuenta = useMemo<CuentaCobranzaResumen | null>(() => {
    const cuenta = cuentas.find((item) => item.id === historyId);
    return cuenta
      ? { ...cuenta, pendiente: 0, estado: "PAGADO" }
      : null;
  }, [cuentas, historyId]);

  const exportCsv = () => {
    const header = ["Código", "Cliente", "Empresa", "Total", "Pagado"];
    const rows = filteredCuentas.map((cuenta) => [
      cuenta.codigo,
      cuenta.cliente,
      cuenta.empresa,
      cuenta.total.toFixed(2),
      cuenta.pagado.toFixed(2),
    ]);
    const content = [header, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF", content], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cotizaciones-pagadas.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handlePaymentsChanged = () => {
    reload();
    reloadPorCobrar();
  };

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">Pagados</h2>
          <p className="text-slate-500">
            Cotizaciones liquidadas e historial real de ingresos.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filteredCuentas.length === 0}
          className="flex items-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#FF9A3D] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={18} /> Exportar pagados
        </button>
      </div>

      <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        <article className="rounded-2xl bg-[#17445A] p-6 text-white shadow-sm">
          <p className="text-sm font-bold text-white/75">Total cobrado</p>
          <h3 className="mt-2 text-3xl font-black">
            {formatCurrency(totalCobrado)}
          </h3>
          <p className="mt-2 text-sm text-white/75">
            Ingresos de cotizaciones liquidadas.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#255F7A]">
            Cotizaciones pagadas
          </p>
          <h3 className="mt-2 text-3xl font-black text-[#17445A]">
            {cuentas.length}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Registros con estado pagado.
          </p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#255F7A]">Total facturado</p>
          <h3 className="mt-2 text-3xl font-black text-[#17445A]">
            {formatCurrency(totalFacturado)}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Valor total de las cotizaciones pagadas.
          </p>
        </article>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
      </section>

      {errorMessage && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-10 text-center font-semibold text-slate-500 shadow-sm">
          Cargando cotizaciones pagadas...
        </section>
      ) : filteredCuentas.length === 0 ? (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <CheckCircle2 className="mx-auto text-green-600" size={38} />
          <h3 className="mt-3 text-xl font-black text-[#17445A]">
            No hay cotizaciones pagadas
          </h3>
          <p className="mt-2 text-slate-500">
            Al liquidar una cuenta, aparecerá automáticamente aquí.
          </p>
        </section>
      ) : (
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h3 className="text-lg font-black text-[#17445A]">
              Historial de cotizaciones pagadas
            </h3>
            <p className="text-sm text-slate-500">
              Registros liquidados según el backend.
            </p>
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
                        className="text-[#17445A] hover:text-[#F5822A]"
                      >
                        {cuenta.codigo}
                      </Link>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-[#17445A]">{cuenta.cliente}</p>
                      <p className="text-slate-500">{cuenta.empresa}</p>
                    </td>
                    <td className="p-4">
                      <CobranzaStatusBadge estado="PAGADO" />
                    </td>
                    <td className="p-4 text-right font-black text-[#17445A]">
                      {formatCurrency(cuenta.total)}
                    </td>
                    <td className="p-4 text-right font-black text-green-700">
                      {formatCurrency(cuenta.pagado)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {historyCuenta && (
        <PagosHistoryModal
          cuenta={historyCuenta}
          cuentasPorCobrar={cuentasPorCobrar}
          onClose={() => setHistoryId(null)}
          onChanged={handlePaymentsChanged}
        />
      )}
    </div>
  );
}
