import type { Proyecto } from "../types/project";

export const proyectosMock: Proyecto[] = [
  {
    id: 1,
    codigo: "ROB07MAR2026",
    solicitante: "Roberto Martínez",
    empresa: "Residencial Campestre",
    telefono: "614 123 4567",
    direccion: "Col. Campestre, Chihuahua, Chih.",
    descripcion:
      "Instalación de sistema de climatización para área residencial, incluyendo equipo, tubería y puesta en marcha.",
    tipoServicio: "Climatización HVAC",
    tipoProyecto: "Residencial",
    estado: "Pendiente",
    fechaRegistro: "2026-03-07",
    tiempoEstimado: "3 días",
    anticipo: 0,
    totalPagado: 0,
    conceptos: [
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
      {
        id: 3,
        descripcion: "Material eléctrico y consumibles",
        unidad: "PAQ",
        cantidad: 1,
        precioUnitario: 1200,
      },
    ],
  },
  {
    id: 2,
    codigo: "SOL12MAR2026",
    solicitante: "Ana López",
    empresa: "Taller del Norte",
    telefono: "614 987 6543",
    direccion: "Av. Tecnológico, Chihuahua, Chih.",
    descripcion:
      "Instalación de sistema fotovoltaico para reducción de consumo eléctrico en negocio comercial.",
    tipoServicio: "Paneles solares",
    tipoProyecto: "Comercial",
    estado: "En trámite",
    fechaRegistro: "2026-03-12",
    fechaEstimadaInicio: "2026-03-20",
    tiempoEstimado: "1 semana",
    anticipo: 35000,
    totalPagado: 35000,
    conceptos: [
      {
        id: 1,
        descripcion: "Módulo solar",
        unidad: "PZA",
        cantidad: 8,
        precioUnitario: 4200,
      },
      {
        id: 2,
        descripcion: "Microinversor",
        unidad: "PZA",
        cantidad: 4,
        precioUnitario: 3800,
      },
      {
        id: 3,
        descripcion: "Instalación y estructura",
        unidad: "SERV",
        cantidad: 1,
        precioUnitario: 18000,
      },
    ],
  },
  {
    id: 3,
    codigo: "HVAC18MAR2026",
    solicitante: "Carlos Hernández",
    empresa: "Local Comercial Centro",
    telefono: "614 555 9812",
    direccion: "Centro, Chihuahua, Chih.",
    descripcion:
      "Trabajo de adecuación HVAC para local comercial, incluyendo suministro, instalación y pruebas.",
    tipoServicio: "Obra / instalación",
    tipoProyecto: "Comercial",
    estado: "X cobrar",
    fechaRegistro: "2026-03-18",
    fechaEstimadaInicio: "2026-03-25",
    tiempoEstimado: "5 días",
    anticipo: 25000,
    totalPagado: 45000,
    conceptos: [
      {
        id: 1,
        descripcion: "Instalación de ductería",
        unidad: "ML",
        cantidad: 20,
        precioUnitario: 650,
      },
      {
        id: 2,
        descripcion: "Equipo HVAC",
        unidad: "PZA",
        cantidad: 1,
        precioUnitario: 52000,
      },
      {
        id: 3,
        descripcion: "Mano de obra especializada",
        unidad: "SERV",
        cantidad: 1,
        precioUnitario: 11200,
      },
    ],
  },
  {
    id: 4,
    codigo: "MAN22MAR2026",
    solicitante: "Laura Torres",
    empresa: "Oficinas Norte",
    telefono: "614 222 8899",
    direccion: "Periférico de la Juventud, Chihuahua, Chih.",
    descripcion:
      "Servicio de mantenimiento preventivo a equipos de climatización instalados en oficinas.",
    tipoServicio: "Mantenimiento",
    tipoProyecto: "Comercial",
    estado: "Pagado",
    fechaRegistro: "2026-03-22",
    tiempoEstimado: "1 día",
    anticipo: 0,
    totalPagado: 8500,
    conceptos: [
      {
        id: 1,
        descripcion: "Mantenimiento preventivo",
        unidad: "SERV",
        cantidad: 5,
        precioUnitario: 1700,
      },
    ],
  },
];

export function calcularTotalProyecto(proyecto: Proyecto) {
  return proyecto.conceptos.reduce(
    (total, concepto) => total + concepto.cantidad * concepto.precioUnitario,
    0
  );
}

export function calcularSaldoPendiente(proyecto: Proyecto) {
  return calcularTotalProyecto(proyecto) - proyecto.totalPagado;
}

export const resumenGeneral = [
  {
    titulo: "Pendientes",
    valor: proyectosMock
      .filter((proyecto) => proyecto.estado === "Pendiente")
      .length.toString(),
    descripcion: "Cotizaciones sin autorizar",
  },
  {
    titulo: "En trámite",
    valor: proyectosMock
      .filter((proyecto) => proyecto.estado === "En trámite")
      .length.toString(),
    descripcion: "Proyectos activos",
  },
  {
    titulo: "X cobrar",
    valor: proyectosMock
      .filter((proyecto) => proyecto.estado === "X cobrar")
      .length.toString(),
    descripcion: "Proyectos con saldo pendiente",
  },
  {
    titulo: "Pagados",
    valor: proyectosMock
      .filter((proyecto) => proyecto.estado === "Pagado")
      .length.toString(),
    descripcion: "Proyectos liquidados",
  },
];