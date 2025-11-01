import { Elysia } from "elysia";
import { logger } from "../utils/logger";

const esProduccion = process.env.NODE_ENV === "production";
const habilitarLogs = process.env.ENABLE_LOGS !== "false";

// Respuestas pre-construidas para errores comunes (más rápido)
const RESPUESTAS_ERROR = {
  NOT_FOUND: { success: false, mensaje: "Recurso no encontrado" },
  PARSE: { success: false, mensaje: "Formato de datos incorrecto" },
  INTERNAL: { success: false, mensaje: "Error interno del servidor. Por favor, inténtelo de nuevo más tarde." },
} as const;

export const handlerError = (app: Elysia) => {
  app.onError(({ code, error, set, request }) => {
    set.headers["Content-Type"] = "application/json; charset=utf-8";

    let errorResponse: any;
    let status: number;

    // Switch optimizado con respuestas pre-construidas
    switch (code) {
      case "NOT_FOUND":
        status = 404;
        errorResponse = RESPUESTAS_ERROR.NOT_FOUND;
        break;

      case "VALIDATION":
        status = 400;
        errorResponse = {
          success: false,
          mensaje: "Datos de entrada inválidos",
          ...(esProduccion ? {} : { detalles: error.message }),
        };
        break;

      case "PARSE":
        status = 400;
        errorResponse = RESPUESTAS_ERROR.PARSE;
        break;

      case "INTERNAL_SERVER_ERROR":
      case "UNKNOWN":
      default:
        status = 500;
        errorResponse = esProduccion
          ? RESPUESTAS_ERROR.INTERNAL
          : {
              success: false,
              mensaje: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            };
        break;
    }

    set.status = status;

    // Obtener datos del request
    const logData = (request as any).__logData || {
      method: request.method,
      url: new URL(request.url).pathname,
    };
    const startTime = (request as any).__startTime || Bun.nanoseconds();
    const duration = ((Bun.nanoseconds() - startTime) / 1_000_000).toFixed(2);

    // Registrar errores críticos en archivo (siempre)
    if (status >= 500) {
      logger.error(
        `${logData.method} ${status} ${logData.url} (${duration}ms)`,
        error
      );
    } else if (status >= 400) {
      // Warnings para errores de cliente
      logger.warn(`${logData.method} ${status} ${logData.url} - ${errorResponse.mensaje}`);
    }

    // Logging en consola (solo si está habilitado)
    if (habilitarLogs) {
      if (esProduccion) {
        // Producción: log simple
        console.log(`${new Date().toISOString().substring(11, 19)} ${logData.method} ${status} ${logData.url}`);
      } else {
        // Desarrollo: log detallado
        console.log(`\n[${new Date().toISOString().substring(11, 19)}] ${logData.url}`);
        console.log(`    metodo: ${logData.method}`);
        console.log(`    estado: ${status}`);
        console.log(`    response: ${JSON.stringify(errorResponse, null, 8)}`);

        if ((logData as any).body !== undefined) {
          const bodyValue = typeof (logData as any).body === 'string'
            ? (logData as any).body
            : JSON.stringify((logData as any).body, null, 8);
          console.log(`    body: ${bodyValue}`);
        }

        console.log(`    tiempo: ${duration}ms`);

        // Stack trace solo para errores críticos
        if (status >= 500 && error instanceof Error) {
          console.log(`    error: ${error.message}`);
          if (error.stack) console.log(`    stack: ${error.stack}`);
        }
        console.log('');
      }
    }

    return errorResponse;
  });
};