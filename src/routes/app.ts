import Elysia from "elysia";
import { citasRutas } from "./citas.routes";
import { pacientesRutas } from "./pacientes.routes";

export function iniciarRutas(app: Elysia) {
  return app.group("/api", (api) =>
    api
      .get("/", () => ({
        success: true,
        mensaje: "API funcionando correctamente",
        timestamp: new Date().toISOString(),
      }))
      .use(citasRutas)
      .use(pacientesRutas)
  );
}
