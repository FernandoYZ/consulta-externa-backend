// src/modules/pacientes/pacientes.types.ts
import { t, Static } from "elysia";

/**
 * Esquema para datos del paciente (basado en QUERY_PACIENTE)
 */
export const PacienteSchema = t.Object({
  IdPaciente: t.Number(),
  NombrePaciente: t.String(),
  Documento: t.String(),
  Historia: t.Union([t.String(), t.Null()]),
  Edad: t.Number(),
  TipoEdad: t.String(),
  Quirurgico: t.String(),
  Patologico: t.String(),
  Alergia: t.String(),
  Obstetrico: t.String(),
  Familiar: t.String(),
  Otros: t.String(),
  NombreMedico: t.String(),
  colegiatura: t.Union([t.String(), t.Null()]),
});

/**
 * Esquema para datos de atención (basado en QUERY_ATENCION)
 */
export const AtencionSchema = t.Object({
  IdAtencion: t.Number(),
  NroCuenta: t.Number(),
  Servicio: t.String(),
  FechaConsulta: t.String(),
  HoraAtencion: t.String(),
  Financiamiento: t.String(),
});

/**
 * Esquema para datos de triaje (basado en QUERY_TRIAJE)
 */
export const TriajeSchema = t.Object({
  Peso: t.Number(),
  Talla: t.Number(),
  PCef: t.Number(),
  Pab: t.Number(),
  Temp: t.Number(),
  Presion: t.Union([t.String(), t.Null()]),
  Pulso: t.Number(),
  FrecResp: t.Number(),
  Saturacion: t.Number(),
  HB: t.Number(),
  MotivoConsulta: t.String(),
  ExamenClinico: t.String(),
  Tratamiento: t.String(),
  Observaciones: t.String(),
  IMC: t.Union([t.Number(), t.Null()]),
});

/**
 * Esquema para los parámetros de la URL
 */
export const IdCuentaParamsSchema = t.Object({
  idCuentaAtencion: t.Numeric(),
});

/**
 * Respuesta completa de datos del paciente
 */
export const DatosPacienteCompletoSchema = t.Object({
  paciente: t.Union([PacienteSchema, t.Null()]),
  atencion: t.Union([AtencionSchema, t.Null()]),
  triaje: t.Union([TriajeSchema, t.Null()]),
});

// Tipos estáticos de TypeScript
export type Paciente = Static<typeof PacienteSchema>;
export type Atencion = Static<typeof AtencionSchema>;
export type Triaje = Static<typeof TriajeSchema>;
export type DatosPacienteCompleto = Static<typeof DatosPacienteCompletoSchema>;