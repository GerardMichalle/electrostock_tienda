import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/utils/slugify";

/**
 * Agrega al catálogo la lista de categorías que pidió el cliente, SIN borrar
 * nada de lo que ya existe.
 *
 *   npm run setup:catalog            (backend/)
 *
 * - Las 3 categorías originales (Sensores, Actuadores, Controladores) quedan
 *   primeras (orden 0, 1, 2) — son las que tienen foto en la home.
 * - Las 20 nuevas van después, en el orden de abajo, cada una con una
 *   subcategoría "General" para poder publicarle productos de una.
 * - Idempotente: se puede correr varias veces.
 *
 * Dev y producción comparten la misma base Neon, así que correrlo una vez
 * deja la tienda en vivo lista.
 */

const prisma = new PrismaClient();

// Categorías destacadas (las de la home). Van primeras.
const FEATURED = ["Sensores", "Actuadores", "Controladores"];

// Categorías nuevas, en orden, después de las destacadas.
// (la lista del cliente incluía "Sensores": ya existe, no se duplica)
const NEW_CATEGORIES = [
  "Arduino",
  "Raspberry PI",
  "Adafruit Feather",
  "Micro:Bit",
  "M5Stack ESP32",
  "Robótica",
  "Motores",
  "Herramientas",
  "Baterías",
  "Componentes",
  "Plataformas",
  "Impresión 3D",
  "Pantallas",
  "Kits Para Montar",
  "Imprescindibles",
  "Radiofrecuencia",
  "Placas Solares",
  "Almacenamiento",
  "Controladores Ethernet",
  "Conversores Serie-USB",
];

async function main() {
  // 1) Orden de las 3 destacadas: 0, 1, 2.
  for (const [i, name] of FEATURED.entries()) {
    const slug = slugify(name);
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (cat && cat.order !== i) {
      await prisma.category.update({ where: { slug }, data: { order: i } });
    }
  }

  // 2) Alta / actualización de las nuevas (orden 3, 4, 5…) + subcategoría "General".
  let created = 0;
  for (const [i, name] of NEW_CATEGORIES.entries()) {
    const slug = slugify(name);
    const order = FEATURED.length + i;
    const before = await prisma.category.findUnique({ where: { slug } });
    const cat = await prisma.category.upsert({
      where: { slug },
      update: { name, order },
      create: { name, slug, order },
    });
    if (!before) created++;

    const subs = await prisma.subcategory.count({ where: { categoryId: cat.id } });
    if (subs === 0) {
      await prisma.subcategory.create({
        data: { name: "General", slug: "general", categoryId: cat.id, order: 0 },
      });
    }
  }

  const cats = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true, subcategories: true } } },
  });
  console.log(`Categorías nuevas creadas: ${created}. Total: ${cats.length}.\n`);
  cats.forEach((c, i) =>
    console.log(
      `  ${String(i).padStart(2)}. ${c.name}  (${c._count.subcategories} subcat · ${c._count.products}p)`,
    ),
  );
  console.log("\nListo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
