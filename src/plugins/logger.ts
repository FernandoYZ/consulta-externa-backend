// src/plugins/logger.ts
import { Elysia } from "elysia";
import pino from "pino";

const esProduccion = process.env.NODE_ENV === "production";

// Configuración del logger según el entorno
export const logger = pino(
  esProduccion
    ? {
        // Producción: logs en formato JSON
        level: process.env.LOG_LEVEL || "info",
        formatters: {
          level: (label) => {
            return { level: label.toUpperCase() };
          },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      }
    : {
        // Desarrollo: logs con pino-pretty
        level: process.env.LOG_LEVEL || "debug",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }
);

// Plugin de Elysia para logging de requests/responses
export const configurarLogger = (app: Elysia) => {
  return app
    .onRequest(({ request }) => {
      // Almacenar el tiempo de inicio y datos del request en el request mismo
      (request as any).__startTime = performance.now();
      (request as any).__logData = {
        method: request.method,
        url: new URL(request.url).pathname,
      };
    })
    .onBeforeHandle(async ({ request, body }) => {
      // Capturar el body si existe
      if (body && !esProduccion) {
        (request as any).__logData.body = body;
      }
    })
    .onAfterHandle(({ request, response, set }) => {
      const startTime = (request as any).__startTime || performance.now();
      const duration = (performance.now() - startTime).toFixed(3);
      const logData = (request as any).__logData || {};
      const status = set.status || 200;

      if (esProduccion) {
        // Producción: formato simple [timestamp] METHOD STATUS /path tiempo
        console.log(
          `[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] ${logData.method} ${status} ${logData.url} ${duration}ms`
        );
      } else {
        // Desarrollo: formato detallado
        console.log(`\n[${new Date().toISOString().replace('T', ' ').substring(0, 19)}] ${logData.url}`);
        console.log(`    metodo: ${logData.method}`);
        console.log(`    estado: ${status}`);

        // Intentar parsear el response si es un objeto
        if (response !== undefined && response !== null) {
          try {
            const responseStr = typeof response === 'string'
              ? response
              : JSON.stringify(response, null, 8);
            console.log(`    response: ${responseStr}`);
          } catch (e) {
            console.log(`    response: ${response}`);
          }
        }

        // Mostrar body si existe
        const bodyValue = logData.body !== undefined && logData.body !== null
          ? (typeof logData.body === 'string' ? logData.body : JSON.stringify(logData.body, null, 8))
          : 'null';
        console.log(`    body: ${bodyValue}`);
        console.log(`    tiempo: ${duration}ms\n`);
      }
    });
};
