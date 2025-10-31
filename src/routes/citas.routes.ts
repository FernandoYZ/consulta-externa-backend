import { Elysia } from "elysia";
import { citasController } from "../modules/citas/citas.controller";

export const citasRutas = new Elysia({ name: "citas.rutas" }).use(
  citasController
);