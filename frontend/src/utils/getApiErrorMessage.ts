import axios from "axios";

function findFirstMessage(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = findFirstMessage(item);

      if (message) {
        return message;
      }
    }

    return null;
  }

  if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) {
      const message = findFirstMessage(item);

      if (message) {
        return message;
      }
    }
  }

  return null;
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "Ocurrió un error inesperado.",
): string {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  if (!error.response) {
    return (
      "No fue posible conectar con el servidor. " +
      "Comprueba que el backend esté encendido."
    );
  }

  return findFirstMessage(error.response.data) ?? fallbackMessage;
}