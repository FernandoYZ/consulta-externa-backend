// src/middlewares/public.app.ts
import type { Elysia } from "elysia";
import { resolve, join, extname } from "path";

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".pdf": "application/pdf",
};

const esProduccion = process.env.NODE_ENV === "production";
const PUBLIC_DIR = resolve(process.cwd(), "public");

// Cache de archivos en producción
const cacheHeaders = esProduccion
  ? { "Cache-Control": "public, max-age=31536000, immutable" }
  : { "Cache-Control": "no-cache" };

export const configurarPublic = (app: Elysia) => {
  return app.get("/public/*", async ({ params, set }) => {
    // @ts-ignore - ElysiaJS captura el wildcard como '*'
    const filePath = params["*"] || "";

    // Prevenir path traversal con resolve
    const fullPath = resolve(PUBLIC_DIR, filePath);
    if (!fullPath.startsWith(PUBLIC_DIR)) {
      set.status = 403;
      return "Forbidden";
    }

    const file = Bun.file(fullPath);

    if (!(await file.exists())) {
      set.status = 404;
      return "Not Found";
    }

    // Content-Type + Cache headers
    const ext = extname(fullPath);
    set.headers["Content-Type"] = MIME_TYPES[ext] || "application/octet-stream";
    Object.assign(set.headers, cacheHeaders);

    return file;
  });
};
