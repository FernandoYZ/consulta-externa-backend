// src/config/database.ts
import type { ConnectionPool, config as SqlConfig, IResult, IProcedureResult } from "mssql";
import { logger } from "../utils/logger";
import {
  inferirTipoSQL,
  procesarResultado,
  type ParamSQL,
  type ParamSalidaSQL,
  type ResultadoSP
} from "../utils/database.util";

const opciones: SqlConfig["options"] = {
  encrypt: false,
  trustServerCertificate: true,
  enableArithAbort: true,
  requestTimeout: 30000, // 30 segundos
  connectTimeout: 15000, // 15 segundos
};

const configuracionDb = (database: string, maxPool: number = 20): SqlConfig => ({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || "localhost",
  database,
  options: opciones,
  pool: {
    min: 2,
    max: maxPool,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 15000,
  },
});

let poolSigh: ConnectionPool | null = null;
let poolSighExterna: ConnectionPool | null = null;

const SIGH = process.env.DB_DATABASE_PRINCIPAL || "SIGH";
const SIGHExterna = process.env.DB_DATABASE_SECUNDARIA || "SIGHExterna";

export const ConexionSIGH = async (): Promise<ConnectionPool> => {
  try {
    // Si ya existe y está conectado, reutilizar
    if (poolSigh && poolSigh.connected) return poolSigh;

    // Lazy import de mssql para que Bun solo lo cargue cuando se necesite
    const sql = await import("mssql");
    const config = configuracionDb(SIGH, 100);
    poolSigh = new sql.ConnectionPool(config);

    // Event handlers optimizados
    poolSigh.on("connect", () => {
      console.log(`[Database] ✅ Conexión establecida a ${SIGH}`);
    });

    poolSigh.on("error", async (err) => {
      console.error(`[Database] ❌ Error en pool ${SIGH}:`, err);
      await logger.error(`Error en pool de conexión ${SIGH}`, err);
    });

    await poolSigh.connect();
    console.log(`[Database] ✅ Pool ${SIGH} iniciado (max: ${config.pool?.max} conexiones)`);
    return poolSigh;
  } catch (error) {
    console.error(`[Database] Error al iniciar pool ${SIGH}:`, error);
    await logger.error(`Error crítico al iniciar pool ${SIGH}`, error as Error);
    throw error;
  }
};

export const ConexionSIGHExterna = async (): Promise<ConnectionPool> => {
  try {
    if (poolSighExterna && poolSighExterna.connected) return poolSighExterna;

    const sql = await import("mssql");
    const config = configuracionDb(SIGHExterna, 20);
    poolSighExterna = new sql.ConnectionPool(config);

    poolSighExterna.on("connect", () => {
      console.log(`[Database] ✅ Conexión establecida a ${SIGHExterna}`);
    });

    poolSighExterna.on("error", async (err) => {
      console.error(`[Database] ❌ Error en pool ${SIGHExterna}:`, err);
      await logger.error(`Error en pool de conexión ${SIGHExterna}`, err);
    });

    await poolSighExterna.connect();
    console.log(`[Database] ✅ Pool ${SIGHExterna} iniciado (max: ${config.pool?.max} conexiones)`);
    return poolSighExterna;
  } catch (error) {
    console.error(`[Database] Error al iniciar pool ${SIGHExterna}:`, error);
    await logger.error(`Error crítico al iniciar pool ${SIGHExterna}`, error as Error);
    throw error;
  }
};

export const cerrarConexiones = async (): Promise<void> => {
  const errores: Error[] = [];

  try {
    if (poolSigh) {
      await poolSigh.close();
      poolSigh = null;
      console.log(`[Database] 🔒 Pool ${SIGH} cerrado`);
    }
  } catch (error) {
    errores.push(error as Error);
    console.error(`[Database] Error al cerrar pool ${SIGH}:`, error);
  }

  try {
    if (poolSighExterna) {
      await poolSighExterna.close();
      poolSighExterna = null;
      console.log(`[Database] 🔒 Pool ${SIGHExterna} cerrado`);
    }
  } catch (error) {
    errores.push(error as Error);
    console.error(`[Database] Error al cerrar pool ${SIGHExterna}:`, error);
  }

  if (errores.length > 0) {
    await logger.error("Errores al cerrar conexiones de base de datos", errores[0]);
    throw errores[0];
  }
};

export async function ejecutarQuery<T = any>(
  consulta: string,
  parametros: Record<string, any | ParamSQL> = {},
  usarPoolExterno: boolean = false,
  retornarPrimero: boolean = false
): Promise<T[] | T | null> {
  const pool = usarPoolExterno ? await ConexionSIGHExterna() : await ConexionSIGH();

  try {
    const request = pool.request();

    // Agregar parámetros
    for (const [clave, param] of Object.entries(parametros)) {
      if (param && typeof param === 'object' && 'tipo' in param && 'valor' in param) {
        // Parámetro con tipo explícito
        request.input(clave, param.tipo, param.valor);
      } else {
        // Auto-detección
        const tipoInferido = await inferirTipoSQL(param);
        request.input(clave, tipoInferido, param);
      }
    }

    const resultado: IResult<T> = await request.query(consulta);
    return procesarResultado(resultado.recordset, retornarPrimero);

  } catch (error) {
    await logger.error(`Error ejecutando query: ${consulta.substring(0, 100)}...`, error as Error);
    throw error;
  }
}

export async function ejecutarSP<T = any>(
  nombreSP: string,
  parametrosEntrada: Record<string, any | ParamSQL> = {},
  parametrosSalida: Record<string, ParamSalidaSQL> = {},
  usarPoolExterno: boolean = false,
  retornarPrimero: boolean = false
): Promise<T[] | T | null | ResultadoSP<T>> {
  const pool = usarPoolExterno ? await ConexionSIGHExterna() : await ConexionSIGH();
  const tieneSalida = Object.keys(parametrosSalida).length > 0;

  try {
    const request = pool.request();

    // Agregar parámetros de entrada
    for (const [clave, param] of Object.entries(parametrosEntrada)) {
      if (param && typeof param === 'object' && 'tipo' in param && 'valor' in param) {
        request.input(clave, param.tipo, param.valor);
      } else {
        const tipoInferido = await inferirTipoSQL(param);
        request.input(clave, tipoInferido, param);
      }
    }

    // Agregar parámetros de salida
    for (const [clave, param] of Object.entries(parametrosSalida)) {
      request.output(clave, param.tipo);
    }

    const resultado: IProcedureResult<T> = await request.execute(nombreSP);

    // Si tiene parámetros de salida, retornar resultado completo
    if (tieneSalida) {
      return {
        recordset: resultado.recordset || [],
        output: resultado.output,
        returnValue: resultado.returnValue
      };
    }

    // Si no tiene salida, comportamiento normal
    return procesarResultado(resultado.recordset, retornarPrimero);

  } catch (error) {
    await logger.error(`Error ejecutando SP: ${nombreSP}`, error as Error);
    throw error;
  }
}

