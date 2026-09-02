import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/errors";
import { signToken } from "../middleware/auth";

const loginSchema = z.object({
  email: z.string().email("Correo inválido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new HttpError(401, "Correo o contraseña incorrectos.");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HttpError(401, "Correo o contraseña incorrectos.");
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });

  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}

export async function me(req: Request, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) throw new HttpError(404, "Usuario no encontrado.");
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Ingresa tu contraseña actual."),
  newPassword: z
    .string()
    .min(8, "La nueva contraseña debe tener al menos 8 caracteres."),
});

export async function changePassword(req: Request, res: Response) {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) throw new HttpError(404, "Usuario no encontrado.");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new HttpError(401, "La contraseña actual no es correcta.");

  if (currentPassword === newPassword) {
    throw new HttpError(400, "La nueva contraseña debe ser distinta de la actual.");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  res.json({ ok: true });
}
