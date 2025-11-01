// src/modules/pacientes/pacientes.controller.ts
import { Elysia } from "elysia";
import { PacientesService } from "./pacientes.service";
import { PacientesRepository } from "./pacientes.repository";
import { IdCuentaParamsSchema } from "./pacientes.types";

/**
 * Inyección de dependencias para el módulo de pacientes
 */
const pacientesDependencies = new Elysia({ name: "pacientes.dependencies" })
  .decorate({
    pacientesRepository: new PacientesRepository(),
  })
  .decorate(({ pacientesRepository }) => ({
    pacientesService: new PacientesService(pacientesRepository),
  }));

/**
 * Controlador de rutas para pacientes
 * Endpoints disponibles:
 * - GET /pacientes/:idCuentaAtencion - Obtiene todos los datos del paciente
 * - GET /pacientes/:idCuentaAtencion/datos - Solo datos del paciente
 * - GET /pacientes/:idCuentaAtencion/atencion - Solo datos de atención
 * - GET /pacientes/:idCuentaAtencion/triaje - Solo datos de triaje
 */
export const pacientesController = new Elysia({
  name: "pacientes.controller",
  prefix: "/pacientes",
})
  .use(pacientesDependencies)

  /**
   * GET /pacientes/:idCuentaAtencion
   * Obtiene todos los datos completos del paciente (paciente + atención + triaje)
   * Ejemplo: GET /api/pacientes/12345
   */
  .get(
    "/:idCuentaAtencion",
    async ({ pacientesService, params }) => {
      const datos = await pacientesService.obtenerDatosCompletos(params.idCuentaAtencion);
      return {
        success: true,
        data: datos,
      };
    },
    {
      params: IdCuentaParamsSchema,
      detail: {
        tags: ["Pacientes"],
        summary: "Obtener datos completos del paciente",
        description: "Retorna todos los datos del paciente, atención y triaje en una sola llamada",
      },
    }
  )

  /**
   * GET /pacientes/:idCuentaAtencion/datos
   * Obtiene solo los datos del paciente
   * Ejemplo: GET /api/pacientes/12345/datos
   */
  .get(
    "/:idCuentaAtencion/datos",
    async ({ pacientesService, params, set }) => {
      const paciente = await pacientesService.obtenerPaciente(params.idCuentaAtencion);

      if (!paciente) {
        set.status = 404;
        return {
          success: false,
          mensaje: "No se encontraron datos del paciente",
        };
      }

      return {
        success: true,
        data: paciente,
      };
    },
    {
      params: IdCuentaParamsSchema,
      detail: {
        tags: ["Pacientes"],
        summary: "Obtener solo datos del paciente",
      },
    }
  )

  /**
   * GET /pacientes/:idCuentaAtencion/atencion
   * Obtiene solo los datos de la atención
   * Ejemplo: GET /api/pacientes/12345/atencion
   */
  .get(
    "/:idCuentaAtencion/atencion",
    async ({ pacientesService, params, set }) => {
      const atencion = await pacientesService.obtenerAtencion(params.idCuentaAtencion);

      if (!atencion) {
        set.status = 404;
        return {
          success: false,
          mensaje: "No se encontraron datos de atención",
        };
      }

      return {
        success: true,
        data: atencion,
      };
    },
    {
      params: IdCuentaParamsSchema,
      detail: {
        tags: ["Pacientes"],
        summary: "Obtener datos de atención",
      },
    }
  )

  /**
   * GET /pacientes/:idCuentaAtencion/triaje
   * Obtiene solo los datos del triaje
   * Ejemplo: GET /api/pacientes/12345/triaje
   */
  .get(
    "/:idCuentaAtencion/triaje",
    async ({ pacientesService, params, set }) => {
      const triaje = await pacientesService.obtenerTriaje(params.idCuentaAtencion);

      if (!triaje) {
        set.status = 404;
        return {
          success: false,
          mensaje: "No se encontraron datos de triaje",
        };
      }

      return {
        success: true,
        data: triaje,
      };
    },
    {
      params: IdCuentaParamsSchema,
      detail: {
        tags: ["Pacientes"],
        summary: "Obtener datos de triaje",
      },
    }
  );