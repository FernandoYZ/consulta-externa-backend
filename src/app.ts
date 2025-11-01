// src/app.ts
import { Elysia } from "elysia";
import { configurarSeguridad } from "./middlewares/security.app";
import { configurarPublic } from "./middlewares/public.app";
import { iniciarRutas } from "./routes/app";
import { configurarCors } from "./middlewares/cors.app";
import { handlerError } from "./handlers/error";
import { configurarLogger } from "./plugins/logger";

export function iniciarApp() {
  const app = new Elysia({
    aot: true,
    normalize: true,
  });

  handlerError(app);

  app.use(configurarCors);
  app.use(configurarSeguridad);
  app.use(configurarLogger);
  app.use(configurarPublic);

  // Rutas de la API
  iniciarRutas(app);

  return app;
}