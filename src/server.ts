// src/server.ts
import { iniciarApp } from "./app";
import { cerrarConexiones } from "./config/database";
import { logger } from "./utils/logger";

const HOST = process.env.HOST || "localhost";
const PORT = parseInt(process.env.PORT || "3000", 10);
const ENTORNO = process.env.NODE_ENV || "development";
const separador = "=".repeat(50);

async function iniciarServidor() {
  try {
    const app = iniciarApp();

    app.listen(
      {
        hostname: HOST,
        port: PORT,
      },
      () => {
        console.log(separador);
        console.log("🚀 SERVIDOR INICIADO CORRECTAMENTE");
        console.log(separador);
        console.log(` • Framework: ElysiaJS`);
        console.log(` • URL:       http://${HOST}:${PORT}`);
        console.log(` • Entorno:   ${ENTORNO}`);
        console.log(` • Runtime:   Bun ${Bun.version}`);
        console.log(separador);
      }
    );

    const cerrarServidor = async () => {
      console.log("\n🔌 Cerrando servidor...");
      await app.stop();
      await cerrarConexiones();
      process.exit(0);
    };
    process.on("SIGINT", cerrarServidor);
    process.on("SIGTERM", cerrarServidor);
  } catch (error) {
    console.error("Error al iniciar el servidor", error);
    await logger.error("Error crítico al iniciar el servidor", error as Error);
    process.exit(1);
  }
}

iniciarServidor();
