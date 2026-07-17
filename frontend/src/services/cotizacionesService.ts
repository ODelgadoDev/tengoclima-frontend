import { cotizacionesApi } from "../api/cotizacionesApi";
import type {
  ConceptoCotizacion,
  ConceptoFormValue,
  CotizacionCreatePayload,
  CotizacionDetalle,
  CotizacionFormValues,
} from "../types/cotizacion";

function toDecimalString(value: number): string {
  return value.toFixed(2);
}

function createCotizacionPayload(
  values: CotizacionFormValues,
): CotizacionCreatePayload {
  if (values.cliente === null) {
    throw new Error("Debes seleccionar un cliente.");
  }

  return {
    cliente: values.cliente,
    codigo: values.codigo.trim(),
    descripcion: values.descripcion.trim(),
    tipo: values.tipo,
    estimado_tiempo: values.estimadoTiempo.trim() || null,
    estado: values.estado,
  };
}

async function createConceptos(
  cotizacionId: number,
  conceptos: ConceptoFormValue[],
): Promise<ConceptoCotizacion[]> {
  const createdConceptos: ConceptoCotizacion[] = [];

  for (const concepto of conceptos) {
    const createdConcepto = await cotizacionesApi.createConcepto({
      cotizacion: cotizacionId,
      descripcion: concepto.descripcion.trim(),
      unidad: concepto.unidad,
      cantidad: toDecimalString(concepto.cantidad),
      precio_unitario: toDecimalString(concepto.precioUnitario),
    });

    createdConceptos.push(createdConcepto);
  }

  return createdConceptos;
}

export const cotizacionesService = {
  async createCotizacionCompleta(
    values: CotizacionFormValues,
  ): Promise<CotizacionDetalle> {
    const cotizacion = await cotizacionesApi.createCotizacion(
      createCotizacionPayload(values),
    );

    const createdConceptos: ConceptoCotizacion[] = [];

    try {
      createdConceptos.push(
        ...(await createConceptos(cotizacion.id, values.conceptos)),
      );
      return await cotizacionesApi.getCotizacion(cotizacion.id);
    } catch (error) {
      for (const concepto of createdConceptos) {
        try {
          await cotizacionesApi.deleteConcepto(concepto.id);
        } catch {
          // Continuamos con la limpieza restante.
        }
      }

      try {
        await cotizacionesApi.deleteCotizacion(cotizacion.id);
      } catch {
        // El error original es el más útil para el usuario.
      }

      throw error;
    }
  },

  async updateCotizacionCompleta(
    cotizacionId: number,
    values: CotizacionFormValues,
    originalConceptos: ConceptoCotizacion[],
  ): Promise<CotizacionDetalle> {
    await cotizacionesApi.updateCotizacion(
      cotizacionId,
      createCotizacionPayload(values),
    );

    const currentIds = new Set(
      values.conceptos
        .map((concepto) => concepto.id)
        .filter((id): id is number => id !== undefined),
    );

    for (const originalConcepto of originalConceptos) {
      if (!currentIds.has(originalConcepto.id)) {
        await cotizacionesApi.deleteConcepto(originalConcepto.id);
      }
    }

    for (const concepto of values.conceptos) {
      const payload = {
        descripcion: concepto.descripcion.trim(),
        unidad: concepto.unidad,
        cantidad: toDecimalString(concepto.cantidad),
        precio_unitario: toDecimalString(concepto.precioUnitario),
      };

      if (concepto.id !== undefined) {
        await cotizacionesApi.updateConcepto(concepto.id, payload);
      } else {
        await cotizacionesApi.createConcepto({
          cotizacion: cotizacionId,
          ...payload,
        });
      }
    }

    return cotizacionesApi.getCotizacion(cotizacionId);
  },
};
