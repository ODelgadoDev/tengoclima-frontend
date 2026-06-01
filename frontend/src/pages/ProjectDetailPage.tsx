import type { ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import {
  calcularSaldoPendiente,
  calcularTotalProyecto,
  proyectosMock,
} from "../data/mockData";

export function ProjectDetailPage() {
  const { id } = useParams();

  const proyecto = proyectosMock.find(
    (proyecto) => proyecto.id === Number(id)
  );

  if (!proyecto) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center shadow-sm">
        <h2 className="text-2xl font-black text-[#17445A]">
          Proyecto no encontrado
        </h2>

        <p className="mt-2 text-slate-500">
          No existe un proyecto con el identificador seleccionado.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-[#255F7A] px-5 py-3 font-bold text-white hover:bg-[#17445A] transition"
        >
          Volver al dashboard
        </Link>
      </div>
    );
  }

  const total = calcularTotalProyecto(proyecto);
  const saldoPendiente = Math.max(calcularSaldoPendiente(proyecto), 0);
  const porcentajePagado =
    total > 0 ? Math.min((proyecto.totalPagado / total) * 100, 100) : 0;

  return (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <Link
            to="/pendientes"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#255F7A] hover:text-[#17445A]"
          >
            <ArrowLeft size={17} />
            Volver
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-black text-[#17445A]">
              {proyecto.codigo}
            </h2>

            <StatusBadge estado={proyecto.estado} />
          </div>

          <p className="mt-1 text-slate-500">
            Detalle completo de cotización/proyecto.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-xl border border-[#255F7A] px-5 py-3 font-bold text-[#255F7A] hover:bg-[#E8F1F5] transition">
            Editar
          </button>

          <button className="rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white hover:bg-[#FF9A3D] transition shadow-sm">
            Generar PDF
          </button>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <article className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader
              title="Información del solicitante"
              description="Datos generales del cliente o empresa."
            />

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoItem
                icon={<User size={20} />}
                label="Solicitante"
                value={proyecto.solicitante}
              />

              <InfoItem
                icon={<FileText size={20} />}
                label="Empresa"
                value={proyecto.empresa}
              />

              <InfoItem
                icon={<Phone size={20} />}
                label="Teléfono"
                value={proyecto.telefono}
              />

              <InfoItem
                icon={<MapPin size={20} />}
                label="Dirección"
                value={proyecto.direccion}
              />
            </div>
          </article>

          <article className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader
              title="Información del proyecto"
              description="Clasificación, fechas y descripción."
            />

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <InfoItem
                icon={<FileText size={20} />}
                label="Servicio"
                value={proyecto.tipoServicio}
              />

              <InfoItem
                icon={<FileText size={20} />}
                label="Tipo de proyecto"
                value={proyecto.tipoProyecto}
              />

              <InfoItem
                icon={<CalendarDays size={20} />}
                label="Fecha de registro"
                value={proyecto.fechaRegistro}
              />

              <InfoItem
                icon={<Clock size={20} />}
                label="Tiempo estimado"
                value={proyecto.tiempoEstimado}
              />

              <div className="md:col-span-2 rounded-2xl bg-[#E8F1F5] p-5">
                <p className="text-sm font-black text-[#255F7A]">
                  Descripción del trabajo
                </p>

                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {proyecto.descripcion}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader
              title="Conceptos del proyecto"
              description="Desglose de unidades, cantidades e importes."
            />

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#E8F1F5] text-[#17445A]">
                  <tr>
                    <th className="text-left p-4">Descripción</th>
                    <th className="text-left p-4">Unidad</th>
                    <th className="text-right p-4">Cantidad</th>
                    <th className="text-right p-4">Precio unitario</th>
                    <th className="text-right p-4">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {proyecto.conceptos.map((concepto) => {
                    const subtotal =
                      concepto.cantidad * concepto.precioUnitario;

                    return (
                      <tr
                        key={concepto.id}
                        className="border-t border-slate-100"
                      >
                        <td className="p-4 text-slate-700">
                          {concepto.descripcion}
                        </td>

                        <td className="p-4 font-bold text-[#255F7A]">
                          {concepto.unidad}
                        </td>

                        <td className="p-4 text-right text-slate-600">
                          {concepto.cantidad}
                        </td>

                        <td className="p-4 text-right text-slate-600">
                          ${concepto.precioUnitario.toLocaleString("es-MX")}
                        </td>

                        <td className="p-4 text-right font-black text-[#17445A]">
                          ${subtotal.toLocaleString("es-MX")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot className="bg-slate-50">
                  <tr>
                    <td
                      colSpan={4}
                      className="p-4 text-right font-black text-[#17445A]"
                    >
                      Total
                    </td>

                    <td className="p-4 text-right text-xl font-black text-[#17445A]">
                      ${total.toLocaleString("es-MX")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader
              title="Resumen financiero"
              description="Totales y estado de pago."
            />

            <div className="p-6 space-y-5">
              <div className="rounded-2xl bg-[#17445A] p-5 text-white">
                <p className="text-sm font-bold text-white/75">
                  Total del proyecto
                </p>

                <p className="mt-2 text-4xl font-black">
                  ${total.toLocaleString("es-MX")}
                </p>
              </div>

              <FinancialRow label="Anticipo" value={proyecto.anticipo} />

              <FinancialRow
                label="Total pagado"
                value={proyecto.totalPagado}
              />

              <FinancialRow
                label="Saldo pendiente"
                value={saldoPendiente}
                danger={saldoPendiente > 0}
              />

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-bold text-[#17445A]">
                    Avance de pago
                  </span>
                  <span className="font-black text-[#255F7A]">
                    {porcentajePagado.toFixed(0)}%
                  </span>
                </div>

                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#F5822A]"
                    style={{ width: `${porcentajePagado}%` }}
                  />
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <SectionHeader
              title="Evidencias"
              description="Vista previa simulada de fotografías."
            />

            <div className="p-6 grid grid-cols-3 gap-3">
              <div className="h-24 rounded-xl bg-[#E8F1F5] border border-slate-200" />
              <div className="h-24 rounded-xl bg-[#E8F1F5] border border-slate-200" />
              <div className="h-24 rounded-xl bg-[#E8F1F5] border border-slate-200" />
            </div>
          </article>

          <article className="rounded-2xl bg-[#255F7A] p-6 text-white shadow-sm">
            <h3 className="text-lg font-black">Acciones rápidas</h3>

            <div className="mt-4 space-y-3">
              <button className="w-full rounded-xl bg-white px-4 py-3 font-bold text-[#17445A] hover:bg-slate-100 transition">
                Marcar como autorizada
              </button>

              <button className="w-full rounded-xl bg-[#F5822A] px-4 py-3 font-bold text-white hover:bg-[#FF9A3D] transition">
                Registrar pago
              </button>

              <button className="w-full rounded-xl border border-white/40 px-4 py-3 font-bold text-white hover:bg-white/10 transition">
                Agregar evidencia
              </button>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}

type SectionHeaderProps = {
  title: string;
  description: string;
};

function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="border-b border-slate-200 px-6 py-4">
      <h3 className="text-lg font-black text-[#17445A]">{title}</h3>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}

type InfoItemProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="h-10 w-10 shrink-0 rounded-xl bg-[#E8F1F5] text-[#255F7A] flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 font-bold text-[#17445A]">{value}</p>
      </div>
    </div>
  );
}

type FinancialRowProps = {
  label: string;
  value: number;
  danger?: boolean;
};

function FinancialRow({ label, value, danger = false }: FinancialRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <div className="flex items-center gap-2">
        <CreditCard size={17} className="text-[#255F7A]" />
        <span className="text-sm font-bold text-slate-500">{label}</span>
      </div>

      <span
        className={`font-black ${
          danger ? "text-red-600" : "text-[#17445A]"
        }`}
      >
        ${value.toLocaleString("es-MX")}
      </span>
    </div>
  );
}