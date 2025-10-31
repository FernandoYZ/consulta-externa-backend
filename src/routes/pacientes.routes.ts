import { Elysia } from "elysia";
import { pacientesController } from "../modules/pacientes/pacientes.controller";

export const pacientesRutas = new Elysia({ name: "pacientes.rutas" }).use(
  pacientesController
);