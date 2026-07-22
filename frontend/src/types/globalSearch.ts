export type GlobalSearchResultType =
  | "CLIENTE"
  | "COTIZACION"
  | "PROYECTO"
  | "USUARIO";

export interface GlobalSearchItem {
  id: number;
  tipo: GlobalSearchResultType;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  estado: string;
  ruta: string;
}

export interface GlobalSearchResponse {
  query: string;
  min_caracteres: number;
  total: number;
  clientes: GlobalSearchItem[];
  cotizaciones: GlobalSearchItem[];
  proyectos: GlobalSearchItem[];
  usuarios: GlobalSearchItem[];
}
