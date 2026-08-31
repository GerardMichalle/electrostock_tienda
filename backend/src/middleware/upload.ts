import fs from "fs";
import path from "path";
import multer from "multer";
import { HttpError } from "../lib/errors";

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(path.join(UPLOAD_ROOT, "products"));
ensureDir(path.join(UPLOAD_ROOT, "receipts"));

function storageFor(subfolder: "products" | "receipts") {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, path.join(UPLOAD_ROOT, subfolder));
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".jpg";
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });
}

const imageFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new HttpError(400, "Solo se permiten imágenes (JPG, PNG, WebP…)."));
    return;
  }
  cb(null, true);
};

export const uploadProductImages = multer({
  storage: storageFor("products"),
  fileFilter: imageFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB por imagen
});

export const uploadReceipt = multer({
  storage: storageFor("receipts"),
  fileFilter: imageFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

/**
 * Ruta pública RELATIVA que se guarda en la base de datos, p. ej.
 * `/uploads/products/171234-987.jpg`. Se guarda relativa (no absoluta con
 * host) para que las imágenes no se rompan si el backend cambia de dominio.
 * El frontend antepone `NEXT_PUBLIC_API_URL` al mostrarlas.
 */
export function uploadUrl(subfolder: "products" | "receipts", filename: string) {
  return `/uploads/${subfolder}/${filename}`;
}

/**
 * Borra del disco el archivo asociado a una URL guardada
 * (`/uploads/products/x.jpg`). No lanza si el archivo ya no existe.
 */
export function removeUpload(url: string | null | undefined) {
  if (!url || !url.startsWith("/uploads/")) return;
  const abs = path.join(UPLOAD_ROOT, url.replace(/^\/uploads\//, ""));
  fs.promises.unlink(abs).catch(() => {
    /* el archivo ya no estaba: no pasa nada */
  });
}
