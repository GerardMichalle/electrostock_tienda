import express from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./lib/errors";

import authRoutes from "./routes/auth.routes";
import categoriesRoutes from "./routes/categories.routes";
import productsRoutes from "./routes/products.routes";
import ordersRoutes from "./routes/orders.routes";

export function createApp() {
  const app = express();

  // En Railway/Render/Fly la app corre detrás de un proxy: confiar en el
  // primer salto para leer bien la IP del cliente (rate-limit) y el protocolo.
  app.set("trust proxy", 1);

  const corsOrigin = process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"];
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Fotos de producto y comprobantes de pago servidos como archivos estáticos
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/orders", ordersRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: "Ruta no encontrada." });
  });

  // Manejador de errores centralizado — siempre al final
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
      return;
    }
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "La imagen es muy pesada (máximo 8 MB)."
          : err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE"
            ? "Enviaste demasiadas imágenes."
            : "No se pudo procesar el archivo.";
      res.status(400).json({ error: message });
      return;
    }
    // eslint-disable-next-line no-console
    console.error(err);
    res.status(500).json({ error: "Error interno del servidor." });
  });

  return app;
}
