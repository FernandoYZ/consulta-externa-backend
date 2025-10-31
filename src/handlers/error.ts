import { Elysia } from "elysia";

const esProduccion = process.env.NODE_ENV === "production";

export const handlerError = (app: Elysia) => {
  app.onError(({ code, error, set, request }) => {
    set.headers["Content-Type"] = "application/json; charset=utf-8";

    // Obtener datos del request
    const logData = (request as any).__logData || {
      method: request.method,
      url: new URL(request.url).pathname,
    };
    const startTime = (request as any).__startTime || performance.now();
    const duration = (performance.now() - startTime).toFixed(3);

    // Preparar respuesta según el tipo de error
    let errorResponse: any;

    switch (code) {
      case "NOT_FOUND":
        set.status = 404;
        errorResponse = {
          success: false,
          mensaje: "Recurso no encontrado",
        };
        break;

      case "VALIDATION":
        set.status = 400;
        errorResponse = {
          success: false,
          mensaje: "Datos de entrada inválidos",
          ...(esProduccion ? {} : { detalles: error.message }),
        };
        break;

      case "PARSE":
        set.status = 400;
        errorResponse = {
          success: false,
          mensaje: "Formato de datos incorrecto",
        };
        break;

      case "INTERNAL_SERVER_ERROR":
      case "UNKNOWN":
      default:
        set.status = 500;
        errorResponse = {
          success: false,
          mensaje: esProduccion
            ? "Error interno del servidor. Por favor, inténtelo de nuevo más tarde."
            : `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        };
        break;
    }

    // Logging según el entorno
    const status = set.status || 500;
    const esErrorCritico = code === "INTERNAL_SERVER_ERROR" || code === "UNKNOWN" || status >= 500;

    if (esProduccion) {
      // Producción: formato simple
      console.log(
        `[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] ${logData.method} ${status} ${logData.url} ${duration}ms`
      );
    } else {
      // Desarrollo: formato detallado
      console.log(`\n[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] ${logData.url}`);
      console.log(`    metodo: ${logData.method}`);
      console.log(`    estado: ${status}`);
      console.log(`    response: ${JSON.stringify(errorResponse, null, 8)}`);

      // Mostrar body si existe
      const bodyValue = (logData as any).body !== undefined && (logData as any).body !== null
        ? (typeof (logData as any).body === 'string' ? (logData as any).body : JSON.stringify((logData as any).body, null, 8))
        : 'null';
      console.log(`    body: ${bodyValue}`);
      console.log(`    tiempo: ${duration}ms`);

      // Detalles del error solo para errores críticos
      if (esErrorCritico) {
        console.log(`    error: ${error instanceof Error ? error.message : String(error)}`);
        if (error instanceof Error && error.stack) {
          console.log(`    stack: ${error.stack}`);
        }
      }
      console.log('');
    }

    return errorResponse;
  });
};