import path from "path";
import PDFDocument from "pdfkit";
import type { Order, OrderItem } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

const PAYMENT_LABEL: Record<string, string> = {
  YAPE: "Yape",
  PLIN: "Plin",
};

const INK = "#0f172a";
const MUTED = "#64748b";
const RULE = "#cbd5e1";
const ACCENT = "#1554b3";

// Logo de marca embebido en la boleta. `assets/` vive junto a `src/`/`dist/`
// (mismo nivel que backend/uploads), así que esta ruta funciona igual en
// dev (ts-node-dev, corre desde src/utils) y en prod (node dist/utils).
const LOGO_PATH = path.join(__dirname, "..", "..", "assets", "brand", "logo-full.png");
const LOGO_ASPECT = 579 / 1170; // alto / ancho del PNG original

function formatDate(date: Date): string {
  // Zona horaria fija de Perú para que la boleta coincida con lo que ve el
  // admin en la tarjeta, sin importar dónde esté desplegado el servidor.
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function money(value: unknown): string {
  return `S/ ${Number(value).toFixed(2)}`;
}

/**
 * Genera la boleta operativa de un pedido como documento PDF en memoria.
 * El llamador se encarga de `doc.pipe(res)` + `doc.end()`.
 */
export function buildOrderPdf(order: OrderWithItems): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const bottom = doc.page.height - doc.page.margins.bottom;

  // Columnas de la tabla de productos (bordes izquierdos + ancho).
  const COL = {
    name: { x: left, w: 250 },
    qty: { x: left + 260, w: 45 },
    unit: { x: left + 315, w: 105 },
    subtotal: { x: left + 425, w: right - (left + 425) },
  };

  const rule = (y: number) => {
    doc
      .moveTo(left, y)
      .lineTo(right, y)
      .lineWidth(0.5)
      .strokeColor(RULE)
      .stroke();
  };

  const sectionTitle = (text: string) => {
    doc.moveDown(0.6);
    doc.font("Helvetica-Bold").fontSize(11).fillColor(INK).text(text);
    doc.moveDown(0.2);
  };

  const field = (label: string, value: string) => {
    doc.font("Helvetica-Bold").fontSize(9.5).fillColor(MUTED).text(`${label}: `, {
      continued: true,
    });
    doc.font("Helvetica").fillColor(INK).text(value || "—");
  };

  // ---- Encabezado: logo a la izquierda, datos del pedido a la derecha ----
  const headerTop = doc.y;
  const logoW = 132;
  const logoH = logoW * LOGO_ASPECT;
  try {
    doc.image(LOGO_PATH, left, headerTop, { width: logoW });
  } catch {
    // Si el asset no está disponible (p.ej. despliegue sin el archivo),
    // no rompemos la boleta: caemos al wordmark de texto.
    doc.font("Helvetica-Bold").fontSize(20).fillColor(INK).text("AMYTRONICS", left, headerTop);
  }

  const infoX = left + logoW + 22;
  const infoW = right - infoX;
  doc
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .fillColor(MUTED)
    .text("BOLETA DE PEDIDO", infoX, headerTop + 4, {
      width: infoW,
      align: "right",
      characterSpacing: 0.6,
    });
  doc
    .font("Helvetica-Bold")
    .fontSize(17)
    .fillColor(INK)
    .text(order.orderNumber, infoX, headerTop + 17, { width: infoW, align: "right" });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(MUTED)
    .text(formatDate(order.createdAt), infoX, headerTop + 39, {
      width: infoW,
      align: "right",
    });

  doc.y = headerTop + Math.max(logoH, 52) + 12;
  doc
    .moveTo(left, doc.y)
    .lineTo(right, doc.y)
    .lineWidth(1.75)
    .strokeColor(ACCENT)
    .stroke();
  doc.moveDown(0.7);

  // ---- Datos de entrega --------------------------------------------------
  sectionTitle("Datos de entrega");
  field("Cliente", order.customerName);
  field("Celular", order.customerPhone);
  field("Dirección", order.address);
  field("Distrito", order.district ?? "");

  // ---- Pago -------------------------------------------------------------
  sectionTitle("Pago");
  field("Método", PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod);

  // ---- Productos -------------------------------------------------------
  sectionTitle("Productos");

  const drawHeader = () => {
    const y = doc.y;
    doc.font("Helvetica-Bold").fontSize(9).fillColor(MUTED);
    doc.text("PRODUCTO", COL.name.x, y, { width: COL.name.w });
    doc.text("CANT.", COL.qty.x, y, { width: COL.qty.w, align: "right" });
    doc.text("P. UNIT.", COL.unit.x, y, { width: COL.unit.w, align: "right" });
    doc.text("SUBTOTAL", COL.subtotal.x, y, {
      width: COL.subtotal.w,
      align: "right",
    });
    doc.y = y + 14;
    rule(doc.y);
    doc.moveDown(0.35);
  };

  drawHeader();

  doc.font("Helvetica").fontSize(10).fillColor(INK);
  for (const item of order.items) {
    const rowH = doc.heightOfString(item.name, { width: COL.name.w }) + 6;

    if (doc.y + rowH > bottom) {
      doc.addPage();
      doc.font("Helvetica").fontSize(10).fillColor(INK);
      drawHeader();
      doc.font("Helvetica").fontSize(10).fillColor(INK);
    }

    const y = doc.y;
    const lineTotal = Number(item.price) * item.qty;
    doc.text(item.name, COL.name.x, y, { width: COL.name.w });
    doc.text(String(item.qty), COL.qty.x, y, { width: COL.qty.w, align: "right" });
    doc.text(money(item.price), COL.unit.x, y, {
      width: COL.unit.w,
      align: "right",
    });
    doc.text(money(lineTotal), COL.subtotal.x, y, {
      width: COL.subtotal.w,
      align: "right",
    });
    doc.y = y + rowH;
  }

  doc.moveDown(0.3);
  rule(doc.y);
  doc.moveDown(0.4);

  const totalY = doc.y;
  doc.font("Helvetica-Bold").fontSize(12).fillColor(INK);
  doc.text("TOTAL", COL.unit.x, totalY, { width: COL.unit.w, align: "right" });
  doc.text(money(order.total), COL.subtotal.x, totalY, {
    width: COL.subtotal.w,
    align: "right",
  });

  doc.moveDown(2);
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MUTED)
    .text(
      "Documento generado automáticamente por el panel de AMYTRONICS.",
      left,
      doc.y,
      { width: right - left },
    );

  return doc;
}
