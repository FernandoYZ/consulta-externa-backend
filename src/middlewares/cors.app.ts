// src/middlewares/cors.app.ts
import type { Elysia } from "elysia";

export const origenesCors = (process.env.CORS_ORIGINS ?? "").split(",").filter(Boolean);
if (!origenesCors.length) origenesCors.push("*");

// Pre-calcular valores estáticos para máximo rendimiento
const permitirTodos = origenesCors.includes("*");
const headersEstaticos = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export const configurarCors = (app: Elysia) => {
  return app.onRequest(({ request, set }) => {
    // Si permitimos todos los orígenes, setear directamente
    if (permitirTodos) {
      set.headers["Access-Control-Allow-Origin"] = "*";
      Object.assign(set.headers, headersEstaticos);

      if (request.method === "OPTIONS") {
        set.status = 204;
        return new Response(null, { status: 204 });
      }
      return;
    }

    // Verificar origen específico
    const origin = request.headers.get("origin");
    if (origin && origenesCors.includes(origin)) {
      set.headers["Access-Control-Allow-Origin"] = origin;
      Object.assign(set.headers, headersEstaticos);

      // Preflight
      if (request.method === "OPTIONS") {
        set.status = 204;
        return new Response(null, { status: 204 });
      }
    }
  });
};
