// src/modules/pacientes/pacientes.service.ts
import { PacientesRepository } from "./pacientes.repository";
import type { Paciente, Atencion, Triaje, DatosPacienteCompleto } from "./pacientes.types";

/**
 * Servicio de lógica de negocio para pacientes
 */
export class PacientesService {
  constructor(private readonly pacientesRepository: PacientesRepository) {}

  /**
   * Obtiene solo los datos del paciente
   */
  async obtenerPaciente(idCuentaAtencion: number): Promise<Paciente | null> {
    // Validación de negocio
    if (idCuentaAtencion <= 0) {
      throw new Error("El ID de cuenta de atención debe ser mayor a 0");
    }

    return this.pacientesRepository.obtenerDatosPaciente(idCuentaAtencion);
  }

  /**
   * Obtiene solo los datos de la atención
   */
  async obtenerAtencion(idCuentaAtencion: number): Promise<Atencion | null> {
    if (idCuentaAtencion <= 0) {
      throw new Error("El ID de cuenta de atención debe ser mayor a 0");
    }

    return this.pacientesRepository.obtenerDatosAtencion(idCuentaAtencion);
  }

  /**
   * Obtiene solo los datos del triaje
   */
  async obtenerTriaje(idCuentaAtencion: number): Promise<Triaje | null> {
    if (idCuentaAtencion <= 0) {
      throw new Error("El ID de cuenta de atención debe ser mayor a 0");
    }

    return this.pacientesRepository.obtenerDatosTriaje(idCuentaAtencion);
  }

  /**
   * Obtiene todos los datos del paciente (paciente + atención + triaje)
   * Método más usado: obtiene toda la información necesaria de una vez
   */
  async obtenerDatosCompletos(idCuentaAtencion: number): Promise<DatosPacienteCompleto> {
    if (idCuentaAtencion <= 0) {
      throw new Error("El ID de cuenta de atención debe ser mayor a 0");
    }

    const datos = await this.pacientesRepository.obtenerDatosCompletos(idCuentaAtencion);

    // Lógica de negocio: validar que al menos el paciente exista
    if (!datos.paciente) {
      throw new Error(`No se encontraron datos para la cuenta de atención: ${idCuentaAtencion}`);
    }

    return datos;
  }
}