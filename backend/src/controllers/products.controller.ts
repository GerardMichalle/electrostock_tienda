import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/errors";
import { slugify } from "../utils/slugify";
import { removeUpload, saveUploads } from "../middleware/upload";

const stockEnum = z.enum(["EN_STOCK", "AGOTADO", "BAJO_PEDIDO"]);

// ---------- Ficha ampliada (columna Product.details, JSON opcional) ----------

const productDetailsSchema = z.object({
  info: z.string().optional(),
  advantages: z
    .array(z.object({ title: z.string(), body: z.string() }))
    .optional(),
  benefits: z.array(z.string()).optional(),
  applications: z.array(z.string()).optional(),
  techSpecs: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
});

type ProductDetails = z.infer<typeof productDetailsSchema>;

/**
 * `details` llega como string JSON dentro del multipart. Lo parsea; si no es
 * JSON válido devuelve el valor tal cual para que zod lo rechace con un 400.
 */
function parseDetailsField(val: unknown): unknown {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

/**
 * Limpia la ficha: recorta textos, descarta filas incompletas. Si al final no
 * queda nada, devuelve `Prisma.DbNull` para dejar la columna en NULL (así la
 * página del producto usa el diseño simple).
 */
function normalizeDetails(
  d: ProductDetails | undefined,
): Prisma.InputJsonValue | typeof Prisma.DbNull | undefined {
  if (d === undefined) return undefined;

  const info = d.info?.trim();
  const advantages = (d.advantages ?? [])
    .map((a) => ({ title: a.title.trim(), body: a.body.trim() }))
    .filter((a) => a.title && a.body);
  const benefits = (d.benefits ?? []).map((s) => s.trim()).filter(Boolean);
  const applications = (d.applications ?? [])
    .map((s) => s.trim())
    .filter(Boolean);
  const techSpecs = (d.techSpecs ?? [])
    .map((t) => ({ label: t.label.trim(), value: t.value.trim() }))
    .filter((t) => t.label && t.value);

  const clean = {
    ...(info ? { info } : {}),
    ...(advantages.length ? { advantages } : {}),
    ...(benefits.length ? { benefits } : {}),
    ...(applications.length ? { applications } : {}),
    ...(techSpecs.length ? { techSpecs } : {}),
  };

  return Object.keys(clean).length
    ? (clean as Prisma.InputJsonValue)
    : Prisma.DbNull;
}

// ---------- Listado público con filtros ----------

export async function listProducts(req: Request, res: Response) {
  const { category, subcategory, search, page = "1", pageSize = "24" } = req.query as Record<
    string,
    string | undefined
  >;

  const where: Prisma.ProductWhereInput = {};
  if (category) where.category = { slug: category };
  if (subcategory) where.subcategory = { slug: subcategory };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  const take = Math.min(Number(pageSize) || 24, 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { order: "asc" } }, category: true, subcategory: true },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.product.count({ where }),
  ]);

  res.json({ items, total, page: Number(page) || 1, pageSize: take });
}

export async function getProductBySlug(req: Request, res: Response) {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: { images: { orderBy: { order: "asc" } }, category: true, subcategory: true },
  });
  if (!product) throw new HttpError(404, "Producto no encontrado.");
  res.json(product);
}

// ---------- Admin: crear / editar / eliminar ----------

const productInputSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  categoryId: z.string().min(1),
  subcategoryId: z.string().min(1),
  stock: stockEnum,
  spec: z.string().optional(),
  description: z.string().optional(),
  details: z.preprocess(parseDetailsField, productDetailsSchema.optional()),
  videoUrl: z.string().url().optional().or(z.literal("")),
});

export async function createProduct(req: Request, res: Response) {
  const parsed = productInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }
  const data = parsed.data;

  const subcategory = await prisma.subcategory.findUnique({
    where: { id: data.subcategoryId },
  });
  if (!subcategory || subcategory.categoryId !== data.categoryId) {
    throw new HttpError(400, "La subcategoría no pertenece a la categoría indicada.");
  }

  const skuTaken = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (skuTaken) throw new HttpError(409, "Ya existe un producto con ese SKU.");

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) {
    throw new HttpError(400, "Sube al menos una foto del producto.");
  }

  const slug = slugify(`${data.name}-${data.sku}`);
  const imageUrls = await saveUploads(files, "products");

  const product = await prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      slug,
      price: data.price,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      stock: data.stock,
      spec: data.spec,
      description: data.description,
      details: normalizeDetails(data.details),
      videoUrl: data.videoUrl || undefined,
      images: {
        create: imageUrls.map((url, index) => ({ url, order: index })),
      },
    },
    include: { images: true },
  });

  res.status(201).json(product);
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  const parsed = productInputSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }
  const data = parsed.data;

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new HttpError(404, "Producto no encontrado.");

  if (data.sku && data.sku !== product.sku) {
    const skuTaken = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (skuTaken) throw new HttpError(409, "Ya existe un producto con ese SKU.");
  }

  // Si cambia la categoría y/o la subcategoría, verifica que sigan siendo
  // coherentes entre sí (misma regla que en createProduct).
  if (data.categoryId || data.subcategoryId) {
    const nextCategoryId = data.categoryId ?? product.categoryId;
    const nextSubcategoryId = data.subcategoryId ?? product.subcategoryId;
    const sub = await prisma.subcategory.findUnique({ where: { id: nextSubcategoryId } });
    if (!sub || sub.categoryId !== nextCategoryId) {
      throw new HttpError(400, "La subcategoría no pertenece a la categoría indicada.");
    }
  }

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const newImageUrls = files.length > 0 ? await saveUploads(files, "products") : [];

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      sku: data.sku,
      price: data.price,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      stock: data.stock,
      spec: data.spec,
      description: data.description,
      details: normalizeDetails(data.details),
      videoUrl: data.videoUrl || undefined,
      ...(newImageUrls.length > 0
        ? {
            images: {
              create: newImageUrls.map((url, index) => ({ url, order: index })),
            },
          }
        : {}),
    },
    include: { images: true },
  });

  res.json(updated);
}

export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!product) throw new HttpError(404, "Producto no encontrado.");

  // Los ítems de pedidos que referencian este producto conservan su copia de
  // nombre/precio/cantidad; al borrarlo su `productId` queda en null
  // (onDelete: SetNull en el schema), así el historial de pedidos no se rompe.
  await prisma.product.delete({ where: { id } });

  // Limpia las fotos de Cloudinary (las filas se borran en cascada). Si algo
  // falla acá el producto ya se borró: no rompemos la respuesta por eso.
  await Promise.allSettled(product.images.map((img) => removeUpload(img.url)));
  res.status(204).send();
}

export async function deleteProductImage(req: Request, res: Response) {
  const { imageId } = req.params;
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) throw new HttpError(404, "Imagen no encontrada.");
  await prisma.productImage.delete({ where: { id: imageId } });
  await removeUpload(image.url);
  res.status(204).send();
}
