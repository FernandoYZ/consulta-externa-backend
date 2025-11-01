// src/utils/logger.ts
import { join } from "path";

const esProduccion = process.env.NODE_ENV === "production";
const LOG_DIR = join(process.cwd(), "logs");

// Crear directorio de logs si no existe
async function ensureLogDir() {
  try {
    await Bun.write(join(LOG_DIR, ".gitkeep"), "");
  } catch {
    // Si falla, el directorio ya existe
  }
}

// Formatear timestamp
function getTimestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// Escribir en archivo de logs
async function writeToFile(filename: string, message: string) {
  const filepath = join(LOG_DIR, filename);
  const timestampedMessage = `[${getTimestamp()}] ${message}\n`;

  try {
    // Append al archivo usando Bun nativo
    const file = Bun.file(filepath);
    const existingContent = await file.exists() ? await file.text() : "";
    await Bun.write(filepath, existingContent + timestampedMessage);
  } catch (error) {
    console.error("Error escribiendo log:", error);
  }
}

export const logger = {
  // Log de error (siempre se guarda en archivo)
  error: async (message: string, error?: Error | unknown) => {
    const errorMsg = error instanceof Error
      ? `${message} | Error: ${error.message}\nStack: ${error.stack}`
      : `${message} | ${String(error)}`;

    // Escribir a archivo
    await writeToFile("errors.log", errorMsg);

    // También mostrar en consola
    console.error(`[ERROR] ${message}`, error);
  },

  // Log de warning
  warn: async (message: string) => {
    if (esProduccion) {
      await writeToFile("warnings.log", message);
    }
    console.warn(`[WARN] ${message}`);
  },

  // Log de info (solo en desarrollo en consola, siempre en archivo en producción)
  info: async (message: string) => {
    if (esProduccion) {
      await writeToFile("info.log", message);
    } else {
      console.log(`[INFO] ${message}`);
    }
  },

  // Log de requests (para auditoría)
  request: async (method: string, path: string, status: number, duration: string, error?: string) => {
    const logMessage = error
      ? `${method} ${status} ${path} ${duration}ms | Error: ${error}`
      : `${method} ${status} ${path} ${duration}ms`;

    if (esProduccion) {
      await writeToFile("requests.log", logMessage);
    }
  },
};

ensureLogDir();
