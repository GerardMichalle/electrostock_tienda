import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/errors";
import { slugify } from "../utils/slugify";

// ---------- Listado público ----------

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      subcategories: { orderBy: { order: "asc" } },
      _count: { select: { products: true } },
    },
  });
  res.json(categories);
}

// ---------- Categorías (admin) ----------

const categoryInputSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio."),
  description: z.string().optional(),
});

export async function createCategory(req: Request, res: Response) {
  const parsed = categoryInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }
  const { name, description } = parsed.data;
  const slug = slugify(name);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new HttpError(409, "Ya existe una categoría con ese nombre.");

  const maxOrder = await prisma.category.aggregate({ _max: { order: true } });
  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
  res.status(201).json(category);
}

export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = categoryInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new HttpError(404, "Categoría no encontrada.");

  // El slug nunca cambia al renombrar: es la clave que enlaza productos y URLs.
  const updated = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name ?? category.name,
      description: parsed.data.description ?? category.description,
    },
  });
  res.json(updated);
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw new HttpError(404, "Categoría no encontrada.");

  if (category._count.products > 0) {
    throw new HttpError(
      409,
      `No se puede borrar: tiene ${category._count.products} producto(s). Muévelos o elimínalos primero.`
    );
  }

  const totalCategories = await prisma.category.count();
  if (totalCategories <= 1) {
    throw new HttpError(409, "Debe existir al menos una categoría.");
  }

  await prisma.category.delete({ where: { id } });
  res.status(204).send();
}

const moveSchema = z.object({ direction: z.enum(["up", "down"]) });

export async function moveCategory(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = moveSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Dirección inválida.");

  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });
  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) throw new HttpError(404, "Categoría no encontrada.");

  const swapWith = parsed.data.direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= categories.length) {
    res.json(categories); // ya está en el borde, no-op
    return;
  }

  const a = categories[index];
  const b = categories[swapWith];
  await prisma.$transaction([
    prisma.category.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.category.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  const updated = await prisma.category.findMany({ orderBy: { order: "asc" } });
  res.json(updated);
}

// ---------- Subcategorías (admin) ----------

export async function createSubcategory(req: Request, res: Response) {
  const { id: categoryId } = req.params;
  const parsed = categoryInputSchema.pick({ name: true }).safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw new HttpError(404, "Categoría no encontrada.");

  const slug = slugify(parsed.data.name);
  const existing = await prisma.subcategory.findUnique({
    where: { categoryId_slug: { categoryId, slug } },
  });
  if (existing) throw new HttpError(409, "Ya existe una subcategoría con ese nombre en esta categoría.");

  const maxOrder = await prisma.subcategory.aggregate({
    where: { categoryId },
    _max: { order: true },
  });

  const subcategory = await prisma.subcategory.create({
    data: {
      name: parsed.data.name,
      slug,
      categoryId,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
  res.status(201).json(subcategory);
}

export async function updateSubcategory(req: Request, res: Response) {
  const { subId } = req.params;
  const parsed = categoryInputSchema.pick({ name: true }).partial().safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  const subcategory = await prisma.subcategory.findUnique({ where: { id: subId } });
  if (!subcategory) throw new HttpError(404, "Subcategoría no encontrada.");

  const updated = await prisma.subcategory.update({
    where: { id: subId },
    data: { name: parsed.data.name ?? subcategory.name },
  });
  res.json(updated);
}

export async function deleteSubcategory(req: Request, res: Response) {
  const { subId } = req.params;
  const subcategory = await prisma.subcategory.findUnique({
    where: { id: subId },
    include: { _count: { select: { products: true } } },
  });
  if (!subcategory) throw new HttpError(404, "Subcategoría no encontrada.");

  if (subcategory._count.products > 0) {
    throw new HttpError(
      409,
      `No se puede borrar: tiene ${subcategory._count.products} producto(s). Muévelos o elimínalos primero.`
    );
  }

  const totalInCategory = await prisma.subcategory.count({
    where: { categoryId: subcategory.categoryId },
  });
  if (totalInCategory <= 1) {
    throw new HttpError(409, "La categoría debe tener al menos una subcategoría.");
  }

  await prisma.subcategory.delete({ where: { id: subId } });
  res.status(204).send();
}

export async function moveSubcategory(req: Request, res: Response) {
  const { subId } = req.params;
  const parsed = moveSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Dirección inválida.");

  const subcategory = await prisma.subcategory.findUnique({ where: { id: subId } });
  if (!subcategory) throw new HttpError(404, "Subcategoría no encontrada.");

  const siblings = await prisma.subcategory.findMany({
    where: { categoryId: subcategory.categoryId },
    orderBy: { order: "asc" },
  });
  const index = siblings.findIndex((s) => s.id === subId);
  const swapWith = parsed.data.direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) {
    res.json(siblings);
    return;
  }

  const a = siblings[index];
  const b = siblings[swapWith];
  await prisma.$transaction([
    prisma.subcategory.update({ where: { id: a.id }, data: { order: b.order } }),
    prisma.subcategory.update({ where: { id: b.id }, data: { order: a.order } }),
  ]);

  const updated = await prisma.subcategory.findMany({
    where: { categoryId: subcategory.categoryId },
    orderBy: { order: "asc" },
  });
  res.json(updated);
}
