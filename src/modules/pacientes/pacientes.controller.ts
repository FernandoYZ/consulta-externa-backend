import { Elysia } from "elysia";
import { PacientesService } from "./pacientes.service";
import { PacientesRepository } from "./pacientes.repository";
import { PacienteBodySchema, PacienteParamsSchema } from "./pacientes.types";

/**
 * Inyecta las dependencias (repositorio y servicio) en el contexto de Elysia.
 * Este es un patrón de Inyección de Dependencias.
 */
const pacientesDependencies = new Elysia({ name: "pacientes.dependencies" }).decorate(
  {
    pacientesRepository: new PacientesRepository(),
  }
).decorate(
    ({ pacientesRepository }) => ({
        pacientesService: new PacientesService(pacientesRepository)
    })
);

export const pacientesController = new Elysia({
  name: "pacientes.controller",
  prefix: "/pacientes",
})
  .use(pacientesDependencies)

  // GET /pacientes
  .get("/", async ({ pacientesService }) => {
    return await pacientesService.getAll();
  })

  // GET /pacientes/:id
  .get(
    "/:id",
    async ({ pacientesService, params, set }) => {
      const paciente = await pacientesService.getById(params.id);
      if (!paciente) {
        set.status = 404;
        return { success: false, mensaje: "Paciente no encontrado" };
      }
      return paciente;
    },
    { params: PacienteParamsSchema }
  )

  // POST /pacientes
  .post("/", ({ pacientesService, body }) => {
    return pacientesService.create(body);
  }, { body: PacienteBodySchema });