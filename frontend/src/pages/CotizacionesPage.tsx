import {
  Calculator,
  FileText,
  ImagePlus,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type {
  TipoProyecto,
  TipoServicio,
  UnidadConcepto,
} from "../types/project";

type ConceptoCotizacion = {
  id: number;
  descripcion: string;
  unidad: UnidadConcepto;
  cantidad: number;
  precioUnitario: number;
};

const unidades: UnidadConcepto[] = ["PZA", "ML", "M2", "SERV", "PAQ"];

const tiposServicio: TipoServicio[] = [
  "Climatización HVAC",
  "Paneles solares",
  "Mantenimiento",
  "Obra / instalación",
  "Sistema especial",
  "Calentador",
  "Mixto",
];

const tiposProyecto: TipoProyecto[] = [
  "Residencial",
  "Comercial",
  "Industrial",
  "Local",
  "Exterior",
];

function generarCodigoCotizacion(nombre: string) {
  const fecha = new Date();

  const iniciales =
    nombre
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((palabra) => palabra[0]?.toUpperCase())
      .join("") || "TC";

  const dia = String(fecha.getDate()).padStart(2, "0");

  const meses = [
    "ENE",
    "FEB",
    "MAR",
    "ABR",
    "MAY",
    "JUN",
    "JUL",
    "AGO",
    "SEP",
    "OCT",
    "NOV",
    "DIC",
  ];

  const mes = meses[fecha.getMonth()];
  const anio = fecha.getFullYear();

  return `${iniciales}${dia}${mes}${anio}`;
}

const conceptosIniciales: ConceptoCotizacion[] = [
  {
    id: 1,
    descripcion: "Instalación de equipo minisplit",
    unidad: "SERV",
    cantidad: 1,
    precioUnitario: 2500,
  },
  {
    id: 2,
    descripcion: "Tubería de cobre para instalación",
    unidad: "ML",
    cantidad: 5,
    precioUnitario: 180,
  },
];

export function CotizacionesPage() {
  const [solicitante, setSolicitante] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoServicio, setTipoServicio] =
    useState<TipoServicio>("Climatización HVAC");
  const [tipoProyecto, setTipoProyecto] =
    useState<TipoProyecto>("Residencial");
  const [tiempoEstimado, setTiempoEstimado] = useState("");
  const [descuento, setDescuento] = useState(0);
  const [anticipo, setAnticipo] = useState(0);
  const [conceptos, setConceptos] =
    useState<ConceptoCotizacion[]>(conceptosIniciales);

  const codigoCotizacion = useMemo(
    () => generarCodigoCotizacion(solicitante),
    [solicitante]
  );

  const subtotal = useMemo(() => {
    return conceptos.reduce((total, concepto) => {
      return total + concepto.cantidad * concepto.precioUnitario;
    }, 0);
  }, [conceptos]);

  const iva = subtotal * 0.16;
  const totalAntesDescuento = subtotal + iva;
  const totalFinal = Math.max(totalAntesDescuento - descuento, 0);
  const saldoPendiente = Math.max(totalFinal - anticipo, 0);

  const agregarConcepto = () => {
    const nuevoConcepto: ConceptoCotizacion = {
      id: Date.now(),
      descripcion: "",
      unidad: "PZA",
      cantidad: 1,
      precioUnitario: 0,
    };

    setConceptos((actuales) => [...actuales, nuevoConcepto]);
  };

  const eliminarConcepto = (id: number) => {
    setConceptos((actuales) =>
      actuales.filter((concepto) => concepto.id !== id)
    );
  };

  const actualizarConcepto = (
    id: number,
    campo: keyof ConceptoCotizacion,
    valor: string | number
  ) => {
    setConceptos((actuales) =>
      actuales.map((concepto) =>
        concepto.id === id
          ? {
              ...concepto,
              [campo]: valor,
            }
          : concepto
      )
    );
  };

  const limpiarFormulario = () => {
    setSolicitante("");
    setEmpresa("");
    setTelefono("");
    setDireccion("");
    setDescripcion("");
    setTipoServicio("Climatización HVAC");
    setTipoProyecto("Residencial");
    setTiempoEstimado("");
    setDescuento(0);
    setAnticipo(0);
    setConceptos(conceptosIniciales);
  };

  const guardarCotizacion = () => {
    alert(
      `Cotización ${codigoCotizacion} generada correctamente.\n\nCuando conectemos Django, aquí se guardará en la base de datos.`
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
            Registro inicial de proyectos pendientes para TENGOCLIMA.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={limpiarFormulario}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#255F7A] px-5 py-3 font-bold text-[#255F7A] hover:bg-[#E8F1F5] transition"
          >
            <RefreshCcw size={18} />
            Limpiar
          </button>

          <button
            onClick={guardarCotizacion}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#F5822A] px-5 py-3 font-bold text-white hover:bg-[#FF9A3D] transition shadow-sm"
          >
            <Save size={18} />
            Guardar cotización
          </button>
        </div>
      </div>

      <section className="mt-6 grid grid-cols-1 2xl:grid-cols-[1fr_420px] gap-6">
        <div className="space-y-6">
          <article className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="rounded-xl bg-[#E8F1F5] p-3 text-[#255F7A]">
                <FileText size={22} />
              </div>

              <div>
                <h3 className="text-lg font-black text-[#17445A]">
                  Datos del solicitante
                </h3>
                <p className="text-sm text-slate-500">
                  Información principal del cliente o empresa.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Solicitante
                </label>
                <input
                  value={solicitante}
                  onChange={(event) => setSolicitante(event.target.value)}
                  placeholder="Ej. Roberto Martínez"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Empresa
                </label>
                <input
                  value={empresa}
                  onChange={(event) => setEmpresa(event.target.value)}
                  placeholder="Ej. Residencial Campestre"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Teléfono
                </label>
                <input
                  value={telefono}
                  onChange={(event) => setTelefono(event.target.value)}
                  placeholder="Ej. 614 000 0000"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Dirección
                </label>
                <input
                  value={direccion}
                  onChange={(event) => setDireccion(event.target.value)}
                  placeholder="Ej. Chihuahua, Chih."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>
            </div>
          </article>

          <article className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
              <div className="rounded-xl bg-[#FFF0E3] p-3 text-[#F5822A]">
                <Calculator size={22} />
              </div>

              <div>
                <h3 className="text-lg font-black text-[#17445A]">
                  Información del proyecto
                </h3>
                <p className="text-sm text-slate-500">
                  Clasificación, descripción y estimación inicial.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Tipo de servicio
                </label>
                <select
                  value={tipoServicio}
                  onChange={(event) =>
                    setTipoServicio(event.target.value as TipoServicio)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                >
                  {tiposServicio.map((servicio) => (
                    <option key={servicio} value={servicio}>
                      {servicio}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Tipo de proyecto
                </label>
                <select
                  value={tipoProyecto}
                  onChange={(event) =>
                    setTipoProyecto(event.target.value as TipoProyecto)
                  }
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                >
                  {tiposProyecto.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-[#17445A]">
                  Tiempo estimado
                </label>
                <input
                  value={tiempoEstimado}
                  onChange={(event) => setTiempoEstimado(event.target.value)}
                  placeholder="Ej. 3 días"
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-bold text-[#17445A]">
                Descripción del proyecto
              </label>
              <textarea
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                placeholder="Describe el trabajo solicitado, condiciones del lugar, necesidades del cliente o detalles importantes."
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#F5822A]"
              />
            </div>
          </article>

          <article className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#17445A]">
                  Conceptos de cotización
                </h3>
                <p className="text-sm text-slate-500">
                  Materiales, servicios, mano de obra o paquetes incluidos.
                </p>
              </div>

              <button
                onClick={agregarConcepto}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#255F7A] px-4 py-2 text-sm font-bold text-white hover:bg-[#17445A] transition"
              >
                <Plus size={17} />
                Agregar concepto
              </button>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#E8F1F5] text-[#17445A]">
                  <tr>
                    <th className="text-left p-3">Descripción</th>
                    <th className="text-left p-3">Unidad</th>
                    <th className="text-right p-3">Cantidad</th>
                    <th className="text-right p-3">Precio unitario</th>
                    <th className="text-right p-3">Importe</th>
                    <th className="text-center p-3">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {conceptos.map((concepto) => {
                    const importe =
                      concepto.cantidad * concepto.precioUnitario;

                    return (
                      <tr key={concepto.id} className="border-t border-slate-100">
                        <td className="p-3 min-w-[260px]">
                          <input
                            value={concepto.descripcion}
                            onChange={(event) =>
                              actualizarConcepto(
                                concepto.id,
                                "descripcion",
                                event.target.value
                              )
                            }
                            placeholder="Descripción del concepto"
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F5822A]"
                          />
                        </td>

                        <td className="p-3 min-w-[120px]">
                          <select
                            value={concepto.unidad}
                            onChange={(event) =>
                              actualizarConcepto(
                                concepto.id,
                                "unidad",
                                event.target.value as UnidadConcepto
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#F5822A]"
                          >
                            {unidades.map((unidad) => (
                              <option key={unidad} value={unidad}>
                                {unidad}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-3 min-w-[130px]">
                          <input
                            type="number"
                            min="0"
                            value={concepto.cantidad}
                            onChange={(event) =>
                              actualizarConcepto(
                                concepto.id,
                                "cantidad",
                                Number(event.target.value)
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-right outline-none focus:ring-2 focus:ring-[#F5822A]"
                          />
                        </td>

                        <td className="p-3 min-w-[160px]">
                          <input
                            type="number"
                            min="0"
                            value={concepto.precioUnitario}
                            onChange={(event) =>
                              actualizarConcepto(
                                concepto.id,
                                "precioUnitario",
                                Number(event.target.value)
                              )
                            }
                            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-right outline-none focus:ring-2 focus:ring-[#F5822A]"
                          />
                        </td>

                        <td className="p-3 text-right font-black text-[#17445A] min-w-[140px]">
                          ${importe.toLocaleString("es-MX")}
                        </td>

                        <td className="p-3">
                          <div className="flex justify-center">
                            <button
                              onClick={() => eliminarConcepto(concepto.id)}
                              disabled={conceptos.length === 1}
                              className="rounded-xl p-2 text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-[#E8F1F5] p-3 text-[#255F7A]">
                <ImagePlus size={22} />
              </div>

              <div>
                <h3 className="text-lg font-black text-[#17445A]">
                  Evidencias
                </h3>
                <p className="text-sm text-slate-500">
                  Más adelante aquí se podrán subir de 1 a 3 fotos del proyecto.
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((foto) => (
                <div
                  key={foto}
                  className="min-h-32 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400"
                >
                  <ImagePlus size={28} />
                  <p className="mt-2 text-sm font-bold">Foto {foto}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-2xl bg-[#17445A] p-6 text-white shadow-sm sticky top-6">
            <p className="text-sm font-bold text-white/70">
              Código generado
            </p>
            <h3 className="mt-2 text-3xl font-black">{codigoCotizacion}</h3>

            <div className="mt-6 space-y-3 border-t border-white/15 pt-5">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/70">Subtotal</span>
                <strong>${subtotal.toLocaleString("es-MX")}</strong>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/70">IVA 16%</span>
                <strong>${iva.toLocaleString("es-MX")}</strong>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-white/70">Total antes de descuento</span>
                <strong>
                  ${totalAntesDescuento.toLocaleString("es-MX")}
                </strong>
              </div>

              <div>
                <label className="text-sm font-bold text-white/80">
                  Descuento
                </label>
                <input
                  type="number"
                  min="0"
                  value={descuento}
                  onChange={(event) => setDescuento(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-right text-white outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-white/80">
                  Anticipo
                </label>
                <input
                  type="number"
                  min="0"
                  value={anticipo}
                  onChange={(event) => setAnticipo(Number(event.target.value))}
                  className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-right text-white outline-none focus:ring-2 focus:ring-[#F5822A]"
                />
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <div className="flex justify-between gap-4">
                  <span className="text-white/75 font-bold">Total final</span>
                  <strong className="text-xl">
                    ${totalFinal.toLocaleString("es-MX")}
                  </strong>
                </div>

                <div className="mt-3 flex justify-between gap-4">
                  <span className="text-white/75 font-bold">Saldo</span>
                  <strong className="text-xl text-[#FFB36B]">
                    ${saldoPendiente.toLocaleString("es-MX")}
                  </strong>
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
            <h3 className="text-lg font-black text-[#17445A]">
              Vista previa
            </h3>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="text-slate-400 font-bold uppercase text-xs">
                  Solicitante
                </p>
                <p className="font-black text-[#17445A]">
                  {solicitante || "Sin capturar"}
                </p>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase text-xs">
                  Empresa
                </p>
                <p className="text-slate-600">{empresa || "Sin capturar"}</p>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase text-xs">
                  Servicio
                </p>
                <p className="text-slate-600">{tipoServicio}</p>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase text-xs">
                  Tipo
                </p>
                <p className="text-slate-600">{tipoProyecto}</p>
              </div>

              <div>
                <p className="text-slate-400 font-bold uppercase text-xs">
                  Tiempo estimado
                </p>
                <p className="text-slate-600">
                  {tiempoEstimado || "Sin capturar"}
                </p>
              </div>

              <div className="rounded-xl bg-[#E8F1F5] p-4">
                <p className="text-sm font-bold text-[#255F7A]">
                  Descripción
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {descripcion || "Sin descripción capturada."}
                </p>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}