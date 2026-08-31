import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/errors";

/**
 * Límite de peticiones muy simple, en memoria y sin dependencias. Suficiente
 * para un backend de una sola instancia (frenar fuerza bruta en /login).
 * Si algún día se escala a varias instancias, reemplazar por un límite con
 * Redis (o el paquete `express-rate-limit` con store compartido).
 */
export function rateLimit(options: { windowMs: number; max: number; message?: string }) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, _res: Response, next: NextFunction) => {
    const key = req.ip ?? req.socket.remoteAddress ?? "desconocido";
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now > entry.resetAt) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > options.max) {
      throw new HttpError(
        429,
        options.message ?? "Demasiados intentos. Espera un momento e inténtalo de nuevo.",
      );
    }
    next();
  };
}
