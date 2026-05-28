import { Plus, Save, Trash2, UploadCloud } from "lucide-react";
import { useState } from "react";

type ConceptoCotizacion = {
  id: number;
  descripcion: string;
  unidad: "PZA" | "ML" | "M2" | "SERV" | "PAQ";
  cantidad: number;
  precioUnitario: number;
};

const conceptosIniciales: ConceptoCotizacion[] = [
  {
    id: 1,
    descripcion: "Instalación de minisplit 1 tonelada",
    unidad: "SERV",
    cantidad: 1,
    precioUnitario: 2500,
  },
  {
    id: 2,
    descripcion: "Tubería de cobre",
    unidad: "ML",
    cantidad: 5,
    precioUnitario: 180,
  },
];

export function CotizacionesPage() {
  const [conceptos, setConceptos] =
    useState<ConceptoCotizacion[]>(conceptosIniciales);

  const totalCotizacion = conceptos.reduce(
    (total, concepto) => total + concepto.cantidad * concepto.precioUnitario,
    0
  );

  const agregarConcepto = () => {
    const nuevoConcepto: ConceptoCotizacion = {
      id: Date.now(),
      descripcion: "",
      unidad: "PZA",
      cantidad: 1,
      precioUnitario: 0,
    };

    setConceptos([...conceptos, nuevoConcepto]);
  };

  const eliminarConcepto = (id: number) => {
    setConceptos(conceptos.filter((concepto) => concepto.id !== id));
  };

  const actualizarConcepto = (
    id: number,
    campo: keyof ConceptoCotizacion,
    valor: string | number
  ) => {
    setConceptos(
      conceptos.map((concepto) =>
        concepto.id === id
          ? {
              ...concepto,
              [campo]: valor,
            }
          : concepto
      )
    );
  };

  return (
    <div>
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#17445A]">
            Nueva cotización
          </h2>
          <p className="text-slate-500">
            Registro de cliente potencial, descripción del trabajo, conceptos y
            evidencia inicial.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="rounded-xl border border-[#255F7A] px-5 py-3 font-bold text-[#255F7A] hover:bg-[#E8F1F5] transition">
            Guardar borrador
          </button>

          <button className="flex items-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white hover:bg-[#FF9A3D] transition shadow-sm">
            <Save size={18} />
            Guardar cotización
          </button>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form className="xl:col-span-2 space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-black text-[#17445A]">
                Datos del solicitante
              </h3>
              <p className="text-sm text-slate-500">
                Información básica del cliente potencial.
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Solicitante
                </label>
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Empresa
                </label>
                <input
                  type="text"
                  placeholder="Empresa o negocio"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Teléfono
                </label>
                <input
                  type="text"
                  placeholder="614 000 0000"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Código identificador
                </label>
                <input
                  type="text"
                  value="ROB07MAR2026"
                  readOnly
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-bold text-[#17445A]">
                  Dirección
                </label>
                <input
                  type="text"
                  placeholder="Dirección del servicio o proyecto"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-black text-[#17445A]">
                Información del proyecto
              </h3>
              <p className="text-sm text-slate-500">
                Clasificación y descripción general del trabajo solicitado.
              </p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Tipo de servicio
                </label>
                <select className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]">
                  <option>Climatización HVAC</option>
                  <option>Paneles solares</option>
                  <option>Obra / instalación</option>
                  <option>Mantenimiento</option>
                  <option>Mixto</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Tipo de proyecto
                </label>
                <select className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]">
                  <option>Local</option>
                  <option>Exterior</option>
                  <option>Residencial</option>
                  <option>Comercial</option>
                  <option>Industrial</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Tiempo estimado
                </label>
                <input
                  type="text"
                  placeholder="Ej. 3 días, 1 semana, 15 días"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Estado inicial
                </label>
                <select className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]">
                  <option>Pendiente</option>
                  <option>En revisión</option>
                  <option>Autorizada</option>
                  <option>No autorizada</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-bold text-[#17445A]">
                  Descripción del trabajo
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe el trabajo solicitado por el cliente..."
                  className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-[#17445A]">
                  Conceptos de cotización
                </h3>
                <p className="text-sm text-slate-500">
                  Puntos, unidades, cantidades y precios del proyecto.
                </p>
              </div>

              <button
                type="button"
                onClick={agregarConcepto}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#255F7A] px-4 py-2 text-sm font-bold text-white hover:bg-[#17445A] transition"
              >
                <Plus size={17} />
                Agregar concepto
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#E8F1F5] text-[#17445A]">
                  <tr>
                    <th className="text-left p-4">Descripción</th>
                    <th className="text-left p-4">Unidad</th>
                    <th className="text-right p-4">Cantidad</th>
                    <th className="text-right p-4">Precio unitario</th>
                    <th className="text-right p-4">Total</th>
                    <th className="text-center p-4">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {conceptos.map((concepto) => {
                    const total =
                      concepto.cantidad * concepto.precioUnitario;

                    return (
                      <tr
                        key={concepto.id}
                        className="border-t border-slate-100"
                      >
                        <td className="p-3 min-w-72">
                          <input
                            type="text"
                            value={concepto.descripcion}
                            onChange={(event) =>
                              actualizarConcepto(
                                concepto.id,
                                "descripcion",
                                event.target.value
                              )
                            }
                            placeholder="Descripción del concepto"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F5822A]"
                          />
                        </td>

                        <td className="p-3 min-w-32">
                          <select
                            value={concepto.unidad}
                            onChange={(event) =>
                              actualizarConcepto(
                                concepto.id,
                                "unidad",
                                event.target
                                  .value as ConceptoCotizacion["unidad"]
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F5822A]"
                          >
                            <option>PZA</option>
                            <option>ML</option>
                            <option>M2</option>
                            <option>SERV</option>
                            <option>PAQ</option>
                          </select>
                        </td>

                        <td className="p-3 min-w-28">
                          <input
                            type="number"
                            value={concepto.cantidad}
                            min={0}
                            onChange={(event) =>
                              actualizarConcepto(
                                concepto.id,
                                "cantidad",
                                Number(event.target.value)
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-right outline-none focus:ring-2 focus:ring-[#F5822A]"
                          />
                        </td>

                        <td className="p-3 min-w-36">
                          <input
                            type="number"
                            value={concepto.precioUnitario}
                            min={0}
                            onChange={(event) =>
                              actualizarConcepto(
                                concepto.id,
                                "precioUnitario",
                                Number(event.target.value)
                              )
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-right outline-none focus:ring-2 focus:ring-[#F5822A]"
                          />
                        </td>

                        <td className="p-4 text-right font-black text-[#17445A] min-w-36">
                          ${total.toLocaleString("es-MX")}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarConcepto(concepto.id)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </form>

        <aside className="space-y-6">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-black text-[#17445A]">
                Resumen de cotización
              </h3>
              <p className="text-sm text-slate-500">
                Vista previa del importe calculado.
              </p>
            </div>

            <div className="p-6">
              <div className="rounded-2xl bg-[#E8F1F5] p-5">
                <p className="text-sm font-bold text-[#255F7A]">
                  Total estimado
                </p>
                <p className="mt-2 text-4xl font-black text-[#17445A]">
                  ${totalCotizacion.toLocaleString("es-MX")}
                </p>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Conceptos</span>
                  <span className="font-bold text-[#17445A]">
                    {conceptos.length}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Estado</span>
                  <span className="rounded-full bg-[#FFF0E3] px-3 py-1 text-xs font-bold text-[#F5822A]">
                    Pendiente
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Código</span>
                  <span className="font-bold text-[#17445A]">
                    ROB07MAR2026
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-black text-[#17445A]">
                Evidencias
              </h3>
              <p className="text-sm text-slate-500">
                Mockup para cargar de 1 a 3 fotografías.
              </p>
            </div>

            <div className="p-6">
              <label className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#255F7A]/40 bg-[#E8F1F5] p-6 text-center hover:bg-[#dbeaf0] transition">
                <UploadCloud size={36} className="text-[#255F7A]" />
                <span className="mt-3 font-bold text-[#17445A]">
                  Subir evidencia
                </span>
                <span className="mt-1 text-sm text-slate-500">
                  PNG, JPG o JPEG · máximo 3 fotos
                </span>

                <input type="file" accept="image/*" multiple className="hidden" />
              </label>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="h-20 rounded-xl bg-slate-100 border border-slate-200" />
                <div className="h-20 rounded-xl bg-slate-100 border border-slate-200" />
                <div className="h-20 rounded-xl bg-slate-100 border border-slate-200" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#17445A] p-6 text-white shadow-sm">
            <h3 className="text-lg font-black">Siguiente paso</h3>
            <p className="mt-2 text-sm text-white/80">
              Cuando la cotización sea autorizada, podrá convertirse en proyecto
              activo y pasar a seguimiento de cobranza.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}