import { cotizacionesApi } from "../api/cotizacionesApi";
import type {
  ConceptoCotizacion,
  ConceptoCreatePayload,
  ConceptoFormValue,
  ConceptoUpdatePayload,
  CotizacionCreatePayload,
  CotizacionDetalle,
  CotizacionFormValues,
} from "../types/cotizacion";

function toDecimalString(value: string, fieldName: string): string {
  const parsedValue = Number(value.replace(",", "."));

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${fieldName} debe ser un número válido.`);
  }

  return parsedValue.toFixed(2);
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
  };
}

async function resolveCatalogoId(
  concepto: ConceptoFormValue,
): Promise<number | null> {
  if (concepto.catalogoId !== null) {
    return concepto.catalogoId;
  }

  if (!concepto.guardarEnCatalogo) {
    return null;
  }

  const catalogo = await cotizacionesApi.createCatalogoConcepto({
    descripcion: concepto.descripcion.trim(),
    unidad: concepto.unidad,
    precio_unitario: toDecimalString(
      concepto.precioUnitario,
      "El precio unitario",
    ),
  });

  return catalogo.id;
}

async function createConceptoPayload(
  cotizacionId: number,
  concepto: ConceptoFormValue,
): Promise<ConceptoCreatePayload> {
  return {
    cotizacion: cotizacionId,
    catalogo: await resolveCatalogoId(concepto),
    descripcion: concepto.descripcion.trim(),
    unidad: concepto.unidad,
    cantidad: toDecimalString(concepto.cantidad, "La cantidad"),
    precio_unitario: toDecimalString(
      concepto.precioUnitario,
      "El precio unitario",
    ),
  };
}

async function createConceptos(
  cotizacionId: number,
  conceptos: ConceptoFormValue[],
): Promise<ConceptoCotizacion[]> {
  const createdConceptos: ConceptoCotizacion[] = [];

  for (const concepto of conceptos) {
    const payload = await createConceptoPayload(cotizacionId, concepto);
    const createdConcepto = await cotizacionesApi.createConcepto(payload);
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
      const payload = await createConceptoPayload(
        cotizacionId,
        concepto,
      );

      if (concepto.id !== undefined) {
        const updatePayload: ConceptoUpdatePayload = {
          catalogo: payload.catalogo,
          descripcion: payload.descripcion,
          unidad: payload.unidad,
          cantidad: payload.cantidad,
          precio_unitario: payload.precio_unitario,
        };
        await cotizacionesApi.updateConcepto(
          concepto.id,
          updatePayload,
        );
      } else {
        await cotizacionesApi.createConcepto(payload);
      }
    }

    return cotizacionesApi.getCotizacion(cotizacionId);
  },
};
