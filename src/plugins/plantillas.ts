import path from "path";
import { fileURLToPath } from "url";
import type { Eta } from "eta";
import { Elysia } from "elysia";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let eta: Eta | null = null;

// Lazy loading: solo carga Eta cuando se necesita
async function getEta(): Promise<Eta> {
  if (eta) return eta;

  const { Eta } = await import("eta");
  eta = new Eta({
    views: path.join(__dirname, "../views"),
    cache: process.env.NODE_ENV === "production",
    autoEscape: true,
    autoTrim: [false, "nl"],
  });

  return eta;
}

// Plugin de Eta para ElysiaJS
export const etaPlugin = new Elysia({ name: "eta" }).derive(({ set }) => ({
  render: async (template: string, data: any = {}) => {
    const etaInstance = await getEta();
    const templatePath = `./${template}`;
    const html = await etaInstance.renderAsync(templatePath, {
      ...data,
      csrfToken: data.csrfToken || "",
    });
    set.headers["Content-Type"] = "text/html; charset=utf-8";
    return html;
  },
}));
