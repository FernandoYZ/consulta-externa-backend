// src/app.ts - VERSION NATIVA (sin plugins pesados)
import { Elysia } from "elysia";
import { configurarCookies } from "./middlewares/cookies.app";
import { configurarSeguridad } from "./middlewares/security.app";
import { configurarPublic } from "./middlewares/public.app";
import { iniciarRutas } from "./routes/app";
import { configurarCors } from "./middlewares/cors.app";

export function iniciarApp() {
  const app = new Elysia();

  // Todos los middlewares ahora son nativos y síncronos
  app
    .use(configurarCors)
    .use(configurarSeguridad)
    .use(configurarCookies)
    .use(configurarPublic);

  iniciarRutas(app);

  return app;
}
