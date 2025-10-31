import { t, Static } from "elysia";

// Esquema para un Paciente. Usamos `t.Union` para permitir null en campos opcionales.
export const PacienteSchema = t.Object({
  id: t.Numeric(),
  nombre: t.String({ minLength: 2 }),
  apellido: t.String({ minLength: 2 }),
  fechaNacimiento: t.String({ format: "date" }),
  telefono: t.Union([t.String(), t.Null()]), // El teléfono puede ser opcional
});

// Esquema para el cuerpo de la solicitud (sin el ID)
export const PacienteBodySchema = t.Omit(PacienteSchema, ["id"]);

// Esquema para los parámetros de la URL (cuando se busca por ID)
export const PacienteParamsSchema = t.Object({
  id: t.Numeric(),
});

// Tipos estáticos para usar en nuestro código
export type Paciente = Static<typeof PacienteSchema>;
export type PacienteBody = Static<typeof PacienteBodySchema>;