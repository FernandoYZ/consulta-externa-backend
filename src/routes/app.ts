import Elysia from "elysia";
import { citasRutas } from "./citas.routes";
import { pacientesRutas } from "./pacientes.routes"; // 1. Importa tus nuevas rutas

export function iniciarRutas(app: Elysia) {
  return app.group(
    "/api", (api) => api
        .get("/", () => {
          return {
            success: true,
            mensaje: "API funcionando correctamente",
            timestamp: new Date().toISOString(),
          };
        })
        .use(citasRutas) // 2. Usa el plugin de rutas de citas
        .use(pacientesRutas) // 3. Para agregar más, simplemente añade otra línea .use()
  );
}
