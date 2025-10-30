// src/server.ts
import { iniciarApp } from "./app";
import { origenesCors } from "./middlewares/cors.app";

const HOST = process.env.HOST || "localhost";
const PORT = parseInt(process.env.PORT || "3000", 10);
const ENTORNO = process.env.NODE_ENV || "development";
const separador = "=".repeat(50)

async function iniciarServidor() {
  try {
    // Lazy loading: las conexiones solo se cargan cuando las llames
    // const { ConexionSIGH, ConexionSIGHExterna } = await import("./config/database");
    // await ConexionSIGH();
    // await ConexionSIGHExterna();

    const app = iniciarApp();

    app.listen({
      hostname: HOST,
      port: PORT,
    }, () => {
      console.log(separador);
      console.log("🚀 SERVIDOR INICIADO CORRECTAMENTE");
      console.log(separador);
      console.log(` • URL: http://${HOST}:${PORT}`);
      console.log(` • Entorno: ${ENTORNO}`);
      console.log(` • Runtime: Bun ${Bun.version}`);
      console.log(` • Framework: ElysiaJS`);
      console.log(" • CORS Configuración:");
      if (origenesCors.includes("*")) {
        console.log("   - CORS configurado para permitir todos los orígenes (CORS: *)");
      } else {
        origenesCors.forEach((origen, index) => {
          console.log(`     ${index + 1}. ${origen}`);
        });
      }
      console.log(separador);
    })

  } catch (error) {
    console.error("Error al iniciar el servidor", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  console.log("\n🔌 Cerrando servidor...");
  const { cerrarConexiones } = await import("./config/database");
  await cerrarConexiones();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🔌 Cerrando servidor...");
  const { cerrarConexiones } = await import("./config/database");
  await cerrarConexiones();
  process.exit(0);
});


iniciarServidor();
