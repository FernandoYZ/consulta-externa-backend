import { Elysia } from "elysia";
import { CitasService } from "./citas.service";
import { CitaBodySchema, CitaParamsSchema } from "./citas.types";

/**
 * Inyecta el servicio de citas en el contexto de Elysia.
 * Esto nos permite acceder a `citasService` en nuestros manejadores de ruta.
 */
const citasServiceProvider = new Elysia({ name: "citas.service.provider" }).decorate(
  "citasService",
  new CitasService()
);

/**
 * Controlador para las rutas de Citas.
 * Agrupa la lógica de manejo de solicitudes HTTP.
 */
export const citasController = new Elysia({
  name: "citas.controller",
  prefix: "/citas", // Prefijo para todas las rutas en este controlador
})
  .use(citasServiceProvider) // Usamos el proveedor del servicio

  // GET /citas
  .get("/", async ({ citasService }) => {
    return await citasService.getAll();
  })

  // GET /citas/:id
  .get(
    "/:id",
    async ({ citasService, params, set }) => {
      const cita = await citasService.getById(params.id);
      if (!cita) {
        set.status = 404;
        return { success: false, mensaje: "Cita no encontrada" };
      }
      return cita;
    },
    { params: CitaParamsSchema }
  )

  // POST /citas
  .post("/", async ({ citasService, body, set }) => {
    const nuevaCita = await citasService.create(body);
    set.status = 201; // Created
    return nuevaCita;
  }, { body: CitaBodySchema })

  // PUT /citas/:id
  .put("/:id", async ({ citasService, params, body, set }) => {
    const citaActualizada = await citasService.update(params.id, body);
    if (!citaActualizada) {
      set.status = 404;
      return { success: false, mensaje: "Cita no encontrada para actualizar" };
    }
    return citaActualizada;
  }, { params: CitaParamsSchema, body: CitaBodySchema })

  // DELETE /citas/:id
  .delete("/:id", async ({ citasService, params, set }) => {
    const fueEliminada = await citasService.delete(params.id);
    if (!fueEliminada) {
      set.status = 404;
      return { success: false, mensaje: "Cita no encontrada para eliminar" };
    }
    set.status = 204; // No Content
  }, { params: CitaParamsSchema });