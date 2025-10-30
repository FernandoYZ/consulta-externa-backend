// src/middlewares/cookies.app.ts
import type { Elysia } from "elysia";

// Utilidades nativas para manejar cookies
export const parseCookies = (cookieHeader: string | null): Record<string, string> => {
  if (!cookieHeader) return {};

  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, value] = cookie.trim().split("=");
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
    return cookies;
  }, {} as Record<string, string>);
};

export const setCookie = (
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    maxAge?: number;
    path?: string;
  } = {}
): string => {
  const {
    httpOnly = true,
    secure = false,
    sameSite = "lax",
    maxAge,
    path = "/",
  } = options;

  let cookieString = `${name}=${encodeURIComponent(value)}; Path=${path}`;

  if (httpOnly) cookieString += "; HttpOnly";
  if (secure) cookieString += "; Secure";
  if (sameSite) cookieString += `; SameSite=${sameSite}`;
  if (maxAge) cookieString += `; Max-Age=${maxAge}`;

  return cookieString;
};

export const configurarCookies = (app: Elysia) => {
  return app.derive(({ request }) => ({
    cookies: parseCookies(request.headers.get("cookie")),
    setCookie: (name: string, value: string, options?: Parameters<typeof setCookie>[2]) =>
      setCookie(name, value, options),
  }));
};
