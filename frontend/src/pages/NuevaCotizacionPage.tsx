import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { evidenciasApi } from "../api/evidenciasApi";
import { CotizacionForm } from "../components/cotizaciones/CotizacionForm";
import { cotizacionesService } from "../services/cotizacionesService";
import type { CotizacionFormValues } from "../types/cotizacion";
import type { ArchivoPendienteCotizacion } from "../types/evidencia";
import { createEmptyCotizacionForm } from "../utils/cotizacionUtils";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export function NuevaCotizacionPage() {
  const navigate = useNavigate();
  const initialValues = useMemo(() => createEmptyCotizacionForm(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (
    values: CotizacionFormValues,
    referencias: ArchivoPendienteCotizacion[] = [],
  ) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const cotizacion =
        await cotizacionesService.createCotizacionCompleta(values);

      const resultados = await Promise.allSettled(
        referencias.map((referencia) =>
          evidenciasApi.createArchivo({
            cotizacion: cotizacion.id,
            tipo: "REFERENCIA",
            archivo: referencia.archivo,
            descripcion: referencia.descripcion,
          }),
        ),
      );
      const fallidas = resultados.filter(
        (resultado) => resultado.status === "rejected",
      ).length;
      const cargadas = referencias.length - fallidas;

      let message = `La cotización ${cotizacion.codigo} fue registrada correctamente.`;
      if (cargadas > 0) {
        message += ` Se cargaron ${cargadas} referencia${cargadas === 1 ? "" : "s"}.`;
      }
      if (fallidas > 0) {
        message += ` ${fallidas} archivo${fallidas === 1 ? "" : "s"} no pudieron subirse; puedes agregarlos desde esta pantalla.`;
      }

      navigate(`/cotizaciones/${cotizacion.id}`, {
        replace: true,
        state: { message },
      });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible registrar la cotización completa.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CotizacionForm
      mode="create"
      initialValues={initialValues}
      isSubmitting={isSubmitting}
      apiErrorMessage={errorMessage}
      onSubmit={handleSubmit}
    />
  );
}
