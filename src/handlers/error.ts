// src/handlers/error.ts
import { Elysia } from "elysia";

const esProduccion = process.env.NODE_ENV === "production";

export const handlerErrores = new Elysia({
  name: "handler-errores",
}).onError(({ code, error, set }) => {
  // Log de todos los errores en desarrollo
  if (!esProduccion) {
    console.error(`[${code}]`, error);
  }

  switch (code) {
    case "NOT_FOUND":
      set.status = 404;
      return {
        success: false,
        mensaje: "Recurso no encontrado",
      };

    case "VALIDATION":
      set.status = 400;
      return {
        success: false,
        mensaje: "Datos de entrada inválidos",
        ...(esProduccion ? {} : { detalles: error.message }),
      };

    case "PARSE":
      set.status = 400;
      return {
        success: false,
        mensaje: "Formato de datos incorrecto",
      };

    case "INTERNAL_SERVER_ERROR":
    case "UNKNOWN":
    default:
      set.status = 500;
      // Solo log en producción para errores críticos
      if (esProduccion) {
        console.error("[ERROR CRÍTICO]", error);
      }
      return {
        success: false,
        mensaje: esProduccion
          ? "Error interno del servidor. Por favor, inténtelo de nuevo más tarde."
          : `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      };
  }
});
