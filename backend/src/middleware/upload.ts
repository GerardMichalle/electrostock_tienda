import fs from "fs";
import path from "path";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { HttpError } from "../lib/errors";

// ---------------------------------------------------------------------------
// Almacenamiento de imágenes (fotos de producto y comprobantes de pago).
//
// - En producción: Cloudinary. multer recibe el archivo en memoria y de ahí
//   se sube con `upload_stream`. En la base guardamos la URL https definitiva
//   (https://res.cloudinary.com/<cloud>/image/upload/v.../electrostock/...).
// - En local sin Cloudinary configurado: se guarda en disco (carpeta
//   `uploads/`) y se sirve como estático, igual que antes. Así el proyecto
//   corre sin configurar nada.
//
// El frontend muestra la URL tal cual (`assetUrl` deja pasar http(s) y
// antepone la API a las rutas `/uploads/...`).
// ---------------------------------------------------------------------------

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

const cloudinaryReady = Boolean(
  CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET,
);

if (cloudinaryReady) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  // eslint-disable-next-line no-console
  console.warn(
    "⚠ Cloudinary no configurado (faltan CLOUDINARY_*). Las imágenes se guardarán en disco local (solo para desarrollo).",
  );
}

const ROOT_FOLDER = "electrostock";
const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

type Subfolder = "products" | "receipts";

const imageFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new HttpError(400, "Solo se permiten imágenes (JPG, PNG, WebP…)."));
    return;
  }
  cb(null, true);
};

function makeUploader() {
  return multer({
    storage: multer.memoryStorage(),
    fileFilter: imageFilter,
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB por imagen
  });
}

export const uploadProductImages = makeUploader();
export const uploadReceipt = makeUploader();

/**
 * Guarda el archivo recibido por multer y devuelve la URL que se persiste en
 * la base de datos: una URL https de Cloudinary en producción, o una ruta
 * relativa `/uploads/...` si se está usando el disco local.
 */
export async function saveUpload(
  file: Express.Multer.File,
  subfolder: Subfolder,
): Promise<string> {
  if (cloudinaryReady) {
    return uploadToCloudinary(file, subfolder);
  }
  return saveToDisk(file, subfolder);
}

/** Sube varios archivos y devuelve sus URLs en el mismo orden de entrada. */
export function saveUploads(
  files: Express.Multer.File[],
  subfolder: Subfolder,
): Promise<string[]> {
  return Promise.all(files.map((file) => saveUpload(file, subfolder)));
}

/**
 * Borra la imagen asociada a una URL guardada, sea de Cloudinary o del disco
 * local. Nunca lanza: un fallo al borrar no debe tumbar la operación.
 */
export async function removeUpload(url: string | null | undefined): Promise<void> {
  if (!url) return;

  const publicId = cloudinaryPublicId(url);
  if (publicId) {
    if (!cloudinaryReady) return;
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch {
      /* ya no existe o Cloudinary falló: seguimos */
    }
    return;
  }

  if (url.startsWith("/uploads/")) {
    const abs = path.join(UPLOAD_ROOT, url.replace(/^\/uploads\//, ""));
    await fs.promises.unlink(abs).catch(() => {
      /* el archivo ya no estaba */
    });
  }
}

// --- Cloudinary -----------------------------------------------------------

function uploadToCloudinary(
  file: Express.Multer.File,
  subfolder: Subfolder,
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `${ROOT_FOLDER}/${subfolder}`, resource_type: "image" },
      (error, result) => {
        if (error || !result) {
          reject(new HttpError(502, "No se pudo subir la imagen. Inténtalo de nuevo."));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });
}

/**
 * De una URL de Cloudinary
 *   https://res.cloudinary.com/<cloud>/image/upload/v123/electrostock/products/abc.jpg
 * extrae el public_id: `electrostock/products/abc`. Devuelve null si no es
 * una URL de Cloudinary.
 */
function cloudinaryPublicId(url: string): string | null {
  if (!url.includes("res.cloudinary.com")) return null;
  const marker = "/upload/";
  const at = url.indexOf(marker);
  if (at === -1) return null;
  return (
    url
      .slice(at + marker.length)
      .replace(/^v\d+\//, "") // prefijo de versión
      .replace(/\?.*$/, "") // query params
      .replace(/\.[^/.]+$/, "") || null // extensión
  );
}

// --- Disco local (fallback de desarrollo) ---------------------------------

async function saveToDisk(
  file: Express.Multer.File,
  subfolder: Subfolder,
): Promise<string> {
  const dir = path.join(UPLOAD_ROOT, subfolder);
  await fs.promises.mkdir(dir, { recursive: true });
  const ext = path.extname(file.originalname) || ".jpg";
  const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  await fs.promises.writeFile(path.join(dir, name), file.buffer);
  return `/uploads/${subfolder}/${name}`;
}
