// src/middlewares/cors.app.ts
import type { Elysia } from "elysia";

export const origenesCors = (process.env.CORS_ORIGINS ?? "").split(",");

export const configurarCors = (app: Elysia) => {
  if (!origenesCors[0]) origenesCors.push("*");

  return app.onRequest(({ request, set }) => {
    const origin = request.headers.get("origin") || "";

    // Verificar si el origen está permitido
    const isAllowed = origenesCors.includes("*") || origenesCors.includes(origin);

    if (isAllowed) {
      set.headers["Access-Control-Allow-Origin"] = origenesCors.includes("*") ? "*" : origin;
      set.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
      set.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
      set.headers["Access-Control-Allow-Credentials"] = "true";
    }

    // Manejar preflight requests
    if (request.method === "OPTIONS") {
      set.status = 204;
      return new Response(null, { status: 204 });
    }
  });
};
