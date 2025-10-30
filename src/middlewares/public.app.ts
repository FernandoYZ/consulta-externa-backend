// src/middlewares/public.app.ts
import type { Elysia } from "elysia";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".pdf": "application/pdf",
};

export const configurarPublic = (app: Elysia) => {
  return app.get("/public/*", async ({ params, set }) => {
    try {
      // @ts-ignore - ElysiaJS captura el wildcard como '*'
      const filePath = params["*"] || "";
      const fullPath = path.join(process.cwd(), "public", filePath);

      // Prevenir path traversal
      if (!fullPath.startsWith(path.join(process.cwd(), "public"))) {
        set.status = 403;
        return "Forbidden";
      }

      const file = Bun.file(fullPath);
      const exists = await file.exists();

      if (!exists) {
        set.status = 404;
        return "Not Found";
      }

      // Establecer Content-Type basado en la extensión
      const ext = path.extname(fullPath);
      set.headers["Content-Type"] = MIME_TYPES[ext] || "application/octet-stream";

      return file;
    } catch (error) {
      set.status = 500;
      return "Internal Server Error";
    }
  });
};;
