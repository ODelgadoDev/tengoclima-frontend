export type EstadoProyecto =
  | "Pendiente"
  | "En trámite"
  | "X cobrar"
  | "Pagado"
  | "Cancelado";

export type TipoServicio =
  | "Climatización HVAC"
  | "Paneles solares"
  | "Mantenimiento"
  | "Obra / instalación"
  | "Sistema especial"
  | "Calentador"
  | "Mixto";

export type TipoProyecto =
  | "Residencial"
  | "Comercial"
  | "Industrial"
  | "Local"
  | "Exterior";

export type UnidadConcepto = "PZA" | "ML" | "M2" | "SERV" | "PAQ";

export type ConceptoProyecto = {
  id: number;
  descripcion: string;
  unidad: UnidadConcepto;
  cantidad: number;
  precioUnitario: number;
};

export type Proyecto = {
  id: number;
  codigo: string;
  solicitante: string;
  empresa: string;
  telefono: string;
  direccion: string;
  descripcion: string;
  tipoServicio: TipoServicio;
  tipoProyecto: TipoProyecto;
  estado: EstadoProyecto;
  fechaRegistro: string;
  fechaEstimadaInicio?: string;
  tiempoEstimado: string;
  conceptos: ConceptoProyecto[];
  anticipo: number;
  totalPagado: number;
};