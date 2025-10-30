import type { ConnectionPool, config as SqlConfig } from "mssql";

const opciones: SqlConfig["options"] = {
  encrypt: false,
  trustServerCertificate: true,
  enableArithAbort: false,
};

const configuracionDb = (database: string, maxPool: number = 20): SqlConfig => ({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST || "localhost",
  database,
  options: opciones,
  pool: {
    min: 0,
    max: maxPool,
    idleTimeoutMillis: 30000,
  },
});

let poolSigh:ConnectionPool | null = null;
let poolSighExterna:ConnectionPool | null = null;

export const ConexionSIGH = async (): Promise<ConnectionPool> => {
  try {
    if (poolSigh && poolSigh.connected) return poolSigh;

    // Lazy loading: solo importa mssql cuando se necesita
    const sql = await import("mssql");
    const config = configuracionDb(process.env.DB_DATABASE_PRINCIPAL || "SIGH", 100);
    poolSigh = new sql.ConnectionPool(config);

    poolSigh.on("connect", () => console.log("[Database] ✅ Conexión establecida a la DB ", process.env.DB_DATABASE_PRINCIPAL));
    poolSigh.on("error", (err) => console.error("[Database] ❌ Error de conexión:", err));

    await poolSigh.connect();
    console.log(`[Database] ✅ ${process.env.DB_DATABASE_PRINCIPAL || "SIGH"} iniciado correctamente`);
    return poolSigh;

  } catch (error) {
    console.error(`[Database] Error al iniciar pool ${process.env.DB_DATABASE_PRINCIPAL}:`, error);
    throw error;
  }
};

export const ConexionSIGHExterna = async (): Promise<ConnectionPool> => {
  try {
    if (poolSighExterna && poolSighExterna.connected) return poolSighExterna;

    // Lazy loading: solo importa mssql cuando se necesita
    const sql = await import("mssql");
    const config = configuracionDb(process.env.DB_DATABASE_EXTERNA || "SIGHExterna", 20);
    poolSighExterna = new sql.ConnectionPool(config);

    poolSighExterna.on("connect", () => console.log("[Database] ✅ Conexión establecida a la DB ", process.env.DB_DATABASE_EXTERNA));
    poolSighExterna.on("error", (err) => console.error("[Database] ❌ Error de conexión:", err));
    await poolSighExterna.connect();
    console.log(`[Database] ✅ ${process.env.DB_DATABASE_EXTERNA || "SIGHExterna"} iniciado correctamente`);
    return poolSighExterna;
  } catch (error) {
    console.error(`[Database] Error al iniciar pool ${process.env.DB_DATABASE_EXTERNA}:`, error);
    throw error;
  }
}

export const cerrarConexiones = async (): Promise<void> => {
  try {
    if (poolSigh) {
      await poolSigh.close();
      poolSigh = null;
      console.log(`[Database] 🔒 Pool ${process.env.DB_DATABASE_PRINCIPAL} cerrado`);
    }
    if (poolSighExterna) {
      await poolSighExterna.close();
      poolSighExterna = null;
      console.log(`[Database] 🔒 Pool ${process.env.DB_DATABASE_EXTERNA} cerrado`);
    }
  } catch (error) {
    console.error("[Database] Error al cerrar conexiones ❌:", error);
    throw error;
  }
};

