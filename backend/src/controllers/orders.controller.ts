import type { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { HttpError } from "../lib/errors";
import { generateOrderNumber } from "../utils/slugify";
import { saveUpload, removeUpload } from "../middleware/upload";
import { buildOrderPdf } from "../utils/order-pdf";

const ORDER_STATUSES = [
  "PENDIENTE_VERIFICACION",
  "PAGO_VERIFICADO",
  "RECHAZADO",
  "ENVIADO",
  "ENTREGADO",
] as const;
type OrderStatusValue = (typeof ORDER_STATUSES)[number];

const orderItemSchema = z.object({
  productId: z.string().min(1),
  qty: z.coerce.number().int().positive(),
});

const orderInputSchema = z.object({
  customerName: z.string().min(1, "El nombre es obligatorio.").max(120),
  customerPhone: z
    .string()
    .min(6, "Ingresa un celular válido.")
    .max(20, "Ingresa un celular válido."),
  address: z.string().min(1, "La dirección es obligatoria.").max(200),
  district: z.string().max(120).optional(),
  paymentMethod: z.enum(["YAPE", "PLIN"]),
  items: z.string().min(1), // JSON string (multipart no soporta arrays anidados directo)
});

export async function createOrder(req: Request, res: Response) {
  const parsed = orderInputSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, parsed.error.issues[0]?.message ?? "Datos inválidos.");
  }

  let items: { productId: string; qty: number }[];
  try {
    items = z.array(orderItemSchema).min(1).parse(JSON.parse(parsed.data.items));
  } catch {
    throw new HttpError(400, "El carrito enviado es inválido.");
  }

  const file = req.file as Express.Multer.File | undefined;
  if (!file) {
    throw new HttpError(400, "Sube la captura del comprobante de pago.");
  }

  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  if (products.length !== productIds.length) {
    throw new HttpError(400, "Uno o más productos del carrito ya no existen.");
  }

  const orderItemsData = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return {
      product: { connect: { id: product.id } },
      name: product.name,
      price: product.price,
      qty: item.qty,
    };
  });

  const total = orderItemsData.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  const receiptUrl = await saveUpload(file, "receipts");

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      address: parsed.data.address,
      district: parsed.data.district,
      paymentMethod: parsed.data.paymentMethod,
      receiptUrl,
      total,
      items: { create: orderItemsData },
    },
    include: { items: true },
  });

  res.status(201).json(order);
}

// ---------- Admin ----------

export async function listOrders(req: Request, res: Response) {
  const { status } = req.query as { status?: string };
  if (status && !ORDER_STATUSES.includes(status as OrderStatusValue)) {
    throw new HttpError(400, "Estado de pedido inválido.");
  }
  const orders = await prisma.order.findMany({
    where: status ? { status: status as OrderStatusValue } : undefined,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
}

export async function getOrder(req: Request, res: Response) {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!order) throw new HttpError(404, "Pedido no encontrado.");
  res.json(order);
}

export async function getOrderReceiptPdf(req: Request, res: Response) {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!order) throw new HttpError(404, "Pedido no encontrado.");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="boleta-${order.orderNumber}.pdf"`
  );

  const doc = buildOrderPdf(order);
  doc.pipe(res);
  doc.end();
}

const statusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export async function updateOrderStatus(req: Request, res: Response) {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "Estado inválido.");

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) throw new HttpError(404, "Pedido no encontrado.");

  const updated = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
  });
  res.json(updated);
}

export async function deleteOrder(req: Request, res: Response) {
  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order) throw new HttpError(404, "Pedido no encontrado.");

  // Los ítems se borran en cascada (onDelete: Cascade en la relación).
  await prisma.order.delete({ where: { id: order.id } });

  // Limpia la captura del comprobante; si falla, el pedido ya se borró.
  await removeUpload(order.receiptUrl).catch(() => {});
  res.status(204).send();
}
