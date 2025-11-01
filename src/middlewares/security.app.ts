// src/middlewares/security.app.ts
import type { Elysia } from "elysia";

// Pre-calcular headers de seguridad (se asignan una vez, no en cada request)
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
} as const;

export const configurarSeguridad = (app: Elysia) => {
  return app.onRequest(({ set }) => {
    // Asignación directa es más rápida que múltiples asignaciones individuales
    Object.assign(set.headers, SECURITY_HEADERS);
  });
};