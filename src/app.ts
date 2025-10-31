// src/app.ts
import { Elysia } from "elysia";
import { configurarCookies } from "./middlewares/cookies.app";
import { configurarSeguridad } from "./middlewares/security.app";
import { configurarPublic } from "./middlewares/public.app";
import { iniciarRutas } from "./routes/app";
import { configurarCors } from "./middlewares/cors.app";
import { handlerError } from "./handlers/error";
import { configurarLogger } from "./plugins/logger";

export function iniciarApp() {
  const app = new Elysia();

  handlerError(app);

  app
    .use(configurarLogger)
    .use(configurarCors)
    .use(configurarSeguridad)
    .use(configurarCookies)
    .use(configurarPublic);

  iniciarRutas(app);

  return app;
}