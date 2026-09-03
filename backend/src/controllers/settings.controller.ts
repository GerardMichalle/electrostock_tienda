import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/errors";
import { saveUpload, removeUpload } from "../middleware/upload";

const SETTINGS_ID = "main";

const EMPTY = {
  businessName: null as string | null,
  yapeNumber: null as string | null,
  yapeQrUrl: null as string | null,
  plinNumber: null as string | null,
  plinQrUrl: null as string | null,
};

/** Lectura pública: el checkout muestra el número y el QR a cualquier visitante. */
export async function getSettings(_req: Request, res: Response) {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: SETTINGS_ID },
  });
  res.json(settings ?? { id: SETTINGS_ID, ...EMPTY });
}

const updateSchema = z.object({
  businessName: z.string().max(120).optional(),
  yapeNumber: z.string().max(40).optional(),
  plinNumber: z.string().max(40).optional(),
  // "1" cuando el admin quita el QR desde el formulario
  yapeQrClear: z.string().optional(),
  plinQrClear: z.string().optional(),
});

const clean = (v?: string): string | null => {
  const t = v?.trim();
  return t ? t : null;
};

type MulterFiles = Record<string, Express.Multer.File[]> | undefined;

/** Escritura admin (multipart: los QR son imágenes). */
export async function updateSettings(req: Request, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }
  const data = parsed.data;
  const files = req.files as MulterFiles;

  const current = await prisma.storeSettings.findUnique({
    where: { id: SETTINGS_ID },
  });

  // Para cada QR: archivo nuevo → sube y reemplaza; clear "1" → borra; nada → deja igual.
  async function resolveQr(
    field: "yapeQr" | "plinQr",
    currentUrl: string | null | undefined,
  ): Promise<string | null | undefined> {
    const file = files?.[`${field}File`]?.[0];
    if (file) {
      const url = await saveUpload(file, "settings");
      if (currentUrl) await removeUpload(currentUrl);
      return url;
    }
    const clearFlag = field === "yapeQr" ? data.yapeQrClear : data.plinQrClear;
    if (clearFlag === "1") {
      if (currentUrl) await removeUpload(currentUrl);
      return null;
    }
    return undefined; // sin cambios
  }

  const yapeQrUrl = await resolveQr("yapeQr", current?.yapeQrUrl);
  const plinQrUrl = await resolveQr("plinQr", current?.plinQrUrl);

  const updated = await prisma.storeSettings.upsert({
    where: { id: SETTINGS_ID },
    create: {
      id: SETTINGS_ID,
      businessName: clean(data.businessName),
      yapeNumber: clean(data.yapeNumber),
      plinNumber: clean(data.plinNumber),
      yapeQrUrl: yapeQrUrl ?? null,
      plinQrUrl: plinQrUrl ?? null,
    },
    update: {
      businessName: clean(data.businessName),
      yapeNumber: clean(data.yapeNumber),
      plinNumber: clean(data.plinNumber),
      ...(yapeQrUrl !== undefined ? { yapeQrUrl } : {}),
      ...(plinQrUrl !== undefined ? { plinQrUrl } : {}),
    },
  });

  res.json(updated);
}
