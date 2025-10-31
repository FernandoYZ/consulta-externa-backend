import { t, Static } from "elysia";

// Esquema para una sola Cita
export const CitaSchema = t.Object({
  id: t.Numeric(),
  fecha: t.String({ format: "date-time", default: new Date().toISOString() }),
  paciente: t.String({ minLength: 3 }),
  motivo: t.String({ minLength: 5 }),
});

// Esquema para el cuerpo de la solicitud al crear/actualizar una Cita (sin el ID)
export const CitaBodySchema = t.Omit(CitaSchema, ["id"]);

// Esquema para los parámetros de la URL (cuando se busca por ID)
export const CitaParamsSchema = t.Object({
  id: t.Numeric(),
});

// Esquema para un array de Citas
export const CitasSchema = t.Array(CitaSchema);

// Esquema para una respuesta de error estándar
export const ErrorSchema = t.Object({
  success: t.Boolean({ default: false }),
  mensaje: t.String(),
});

// Esquema para una respuesta de "No Encontrado"
export const NotFoundSchema = t.Object({
  success: t.Boolean({ default: false }),
  mensaje: t.String({ default: "Recurso no encontrado" }),
});

// Tipos estáticos inferidos de los esquemas para usar en TypeScript
export type Cita = Static<typeof CitaSchema>;
export type CitaBody = Static<typeof CitaBodySchema>;
export type CitaParams = Static<typeof CitaParamsSchema>;