import Elysia from "elysia";

export function iniciarRutas(app: Elysia) {
  return app
    .get("/api", () => {
      return {
        success: true,
        mensaje: "API funcionando correctamente",
        timestamp: new Date().toISOString(),
      };
    })
}
