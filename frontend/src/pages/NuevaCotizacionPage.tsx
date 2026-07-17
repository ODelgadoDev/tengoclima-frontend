import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CotizacionForm } from "../components/cotizaciones/CotizacionForm";
import { cotizacionesService } from "../services/cotizacionesService";
import type { CotizacionFormValues } from "../types/cotizacion";
import { createEmptyCotizacionForm } from "../utils/cotizacionUtils";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export function NuevaCotizacionPage() {
  const navigate = useNavigate();
  const initialValues = useMemo(() => createEmptyCotizacionForm(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (values: CotizacionFormValues) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const cotizacion =
        await cotizacionesService.createCotizacionCompleta(values);

      navigate(`/cotizaciones/${cotizacion.id}`, {
        replace: true,
        state: {
          message: `La cotización ${cotizacion.codigo} fue registrada correctamente.`,
        },
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
