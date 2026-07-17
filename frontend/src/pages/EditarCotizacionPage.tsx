import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { cotizacionesApi } from "../api/cotizacionesApi";
import { CotizacionForm } from "../components/cotizaciones/CotizacionForm";
import { cotizacionesService } from "../services/cotizacionesService";
import type {
  CotizacionDetalle,
  CotizacionFormValues,
} from "../types/cotizacion";
import { mapCotizacionToForm } from "../utils/cotizacionUtils";
import { getApiErrorMessage } from "../utils/getApiErrorMessage";

export function EditarCotizacionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cotizacionId = Number(id);
  const isValidId = Number.isInteger(cotizacionId) && cotizacionId > 0;

  const [cotizacion, setCotizacion] =
    useState<CotizacionDetalle | null>(null);
  const [isLoading, setIsLoading] = useState(isValidId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    isValidId ? "" : "El identificador de la cotización no es válido.",
  );

  useEffect(() => {
    if (!isValidId) {
      return;
    }

    let isActive = true;

    const loadCotizacion = async () => {
      try {
        const response = await cotizacionesApi.getCotizacion(cotizacionId);

        if (isActive) {
          setCotizacion(response);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            getApiErrorMessage(
              error,
              "No fue posible cargar la cotización.",
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadCotizacion();

    return () => {
      isActive = false;
    };
  }, [cotizacionId, isValidId]);

  const handleSubmit = async (values: CotizacionFormValues) => {
    if (!cotizacion) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const updatedCotizacion =
        await cotizacionesService.updateCotizacionCompleta(
          cotizacion.id,
          values,
          cotizacion.conceptos,
        );

      navigate(`/cotizaciones/${updatedCotizacion.id}`, {
        replace: true,
        state: {
          message: `La cotización ${updatedCotizacion.codigo} fue actualizada correctamente.`,
        },
      });
    } catch (error) {
      setErrorMessage(
        getApiErrorMessage(
          error,
          "No fue posible actualizar la cotización completa.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#F5822A]" />
          <p className="mt-4 font-semibold text-[#17445A]">
            Cargando cotización...
          </p>
        </div>
      </div>
    );
  }

  if (!cotizacion) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="font-black text-red-700">
          No fue posible abrir la cotización
        </h2>
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      </div>
    );
  }

  return (
    <CotizacionForm
      key={`${cotizacion.id}-${cotizacion.fecha_actualizacion}`}
      mode="edit"
      initialValues={mapCotizacionToForm(cotizacion)}
      isSubmitting={isSubmitting}
      apiErrorMessage={errorMessage}
      onSubmit={handleSubmit}
    />
  );
}
