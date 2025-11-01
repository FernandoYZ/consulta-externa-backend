// src/modules/pacientes/pacientes.repository.ts
import type { Paciente, Atencion, Triaje } from "./pacientes.types";
import { ejecutarQuery } from "../../config/database";
import { QUERY_PACIENTE, QUERY_ATENCION, QUERY_TRIAJE } from "../../queries/imprimir.query";

/**
 * Repositorio para datos de pacientes
 * Usa las queries optimizadas de imprimir.query.ts
 */
export class PacientesRepository {
  /**
   * Obtiene los datos del paciente por ID de cuenta de atención
   * Usa QUERY_PACIENTE de imprimir.query.ts
   */
  async obtenerDatosPaciente(idCuentaAtencion: number): Promise<Paciente | null> {
    try {
      const resultado = await ejecutarQuery<Paciente>(
        QUERY_PACIENTE,
        { idCuentaAtencion }
      );

      return resultado[0] || null;
    } catch (error) {
      console.error(`[Repository] Error obteniendo datos del paciente (cuenta: ${idCuentaAtencion}):`, error);
      throw error;
    }
  }

  /**
   * Obtiene los datos de la atención
   * Usa QUERY_ATENCION de imprimir.query.ts
   */
  async obtenerDatosAtencion(idCuentaAtencion: number): Promise<Atencion | null> {
    try {
      const resultado = await ejecutarQuery<Atencion>(
        QUERY_ATENCION,
        { idCuentaAtencion }
      );

      return resultado[0] || null;
    } catch (error) {
      console.error(`[Repository] Error obteniendo datos de atención (cuenta: ${idCuentaAtencion}):`, error);
      throw error;
    }
  }

  /**
   * Obtiene los datos del triaje
   * Usa QUERY_TRIAJE de imprimir.query.ts
   * NOTA: Esta query usa SIGH_EXTERNA
   */
  async obtenerDatosTriaje(idCuentaAtencion: number): Promise<Triaje | null> {
    try {
      // usarPoolExterno = true porque QUERY_TRIAJE usa SIGH_EXTERNA
      const resultado = await ejecutarQuery<Triaje>(
        QUERY_TRIAJE,
        { idCuentaAtencion },
        true // Usar pool externo
      );

      return resultado[0] || null;
    } catch (error) {
      console.error(`[Repository] Error obteniendo datos de triaje (cuenta: ${idCuentaAtencion}):`, error);
      throw error;
    }
  }

  /**
   * Obtiene todos los datos del paciente en una sola llamada
   * Ejecuta las 3 queries en paralelo para máximo rendimiento
   */
  async obtenerDatosCompletos(idCuentaAtencion: number) {
    try {
      // Ejecutar las 3 queries en paralelo con Promise.all (más rápido)
      const [paciente, atencion, triaje] = await Promise.all([
        this.obtenerDatosPaciente(idCuentaAtencion),
        this.obtenerDatosAtencion(idCuentaAtencion),
        this.obtenerDatosTriaje(idCuentaAtencion),
      ]);

      return {
        paciente,
        atencion,
        triaje,
      };
    } catch (error) {
      console.error(`[Repository] Error obteniendo datos completos (cuenta: ${idCuentaAtencion}):`, error);
      throw error;
    }
  }
}