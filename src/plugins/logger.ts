// src/plugins/logger.ts
import { Elysia } from "elysia";

const esProduccion = process.env.NODE_ENV === "production";
const habilitarLogs = process.env.ENABLE_LOGS !== "false";

export const configurarLogger = (app: Elysia) => {
  if (!habilitarLogs) return app;

  if (esProduccion) {
    // Producción: solo tiempo y status
    return app.onAfterHandle(({ request, set }) => {
      const status = set.status || 200;
      const url = new URL(request.url).pathname;
      console.log(`${new Date().toISOString().substring(11, 19)} ${request.method} ${status} ${url}`);
    });
  }

  // Desarrollo: logs detallados con timing
  return app
    .onRequest(({ request }) => {
      (request as any).__startTime = Bun.nanoseconds();
      (request as any).__logData = {
        method: request.method,
        url: new URL(request.url).pathname,
      };
    })
    .onBeforeHandle(({ request, body }) => {
      if (body) {
        (request as any).__logData.body = body;
      }
    })
    .onAfterHandle(({ request, response, set }) => {
      const startTime = (request as any).__startTime || Bun.nanoseconds();
      const duration = ((Bun.nanoseconds() - startTime) / 1_000_000).toFixed(2);
      const logData = (request as any).__logData || {};
      const status = set.status || 200;

      console.log(`\n[${new Date().toISOString().substring(11, 19)}] ${logData.url}`);
      console.log(`    metodo: ${logData.method}`);
      console.log(`    estado: ${status}`);

      if (response !== undefined && response !== null) {
        try {
          const responseStr = typeof response === 'string'
            ? response
            : JSON.stringify(response, null, 8);
          console.log(`    response: ${responseStr}`);
        } catch {
          console.log(`    response: ${response}`);
        }
      }

      if (logData.body !== undefined && logData.body !== null) {
        const bodyValue = typeof logData.body === 'string'
          ? logData.body
          : JSON.stringify(logData.body, null, 8);
        console.log(`    body: ${bodyValue}`);
      }

      console.log(`    tiempo: ${duration}ms\n`);
    });
};
