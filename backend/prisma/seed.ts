import "dotenv/config";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/utils/slugify";

const prisma = new PrismaClient();

const categoriesSeed = [
  {
    name: "Sensores",
    description: "Temperatura, distancia, gas, movimiento y más",
    subcategories: [
      "Temperatura y humedad",
      "Proximidad y distancia",
      "Gas",
      "Posición e inerciales",
      "Cámaras",
    ],
  },
  {
    name: "Actuadores",
    description: "Motores, servos, bombas y válvulas",
    subcategories: [
      "Motores DC",
      "Servomotores",
      "Motores paso a paso",
      "Bombas y válvulas",
    ],
  },
  {
    name: "Controladores",
    description: "Placas, microcontroladores y programadores",
    subcategories: ["Arduino", "ESP32 / ESP8266", "Raspberry Pi", "PLC"],
  },
];

type StockValue = "EN_STOCK" | "AGOTADO" | "BAJO_PEDIDO";

const productsSeed: {
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  subcategory: string;
  stock: StockValue;
  spec: string;
  description: string;
  photo: number;
}[] = [
  { name: "Sensor Ultrasónico HC-SR04", sku: "SEN-0104", price: 12, compareAtPrice: 16, category: "Sensores", subcategory: "Proximidad y distancia", stock: "EN_STOCK", spec: "2cm–400cm · 5V · Trigger/Echo", description: "Mide distancias entre 2cm y 400cm usando eco de ultrasonido. Ideal para robots evasores de obstáculos, medidores de nivel y proyectos de automatización.", photo: 1 },
  { name: "Sensor de Proximidad Infrarrojo IR", sku: "SEN-0119", price: 6, category: "Sensores", subcategory: "Proximidad y distancia", stock: "EN_STOCK", spec: "2cm–30cm · Salida digital", description: "Detecta objetos cercanos mediante infrarrojo, con salida digital lista para conectar a cualquier microcontrolador. Perfecto para robots seguidores de línea.", photo: 2 },
  { name: "Sensor de Temperatura y Humedad DHT22", sku: "SEN-0301", price: 18, compareAtPrice: 24, category: "Sensores", subcategory: "Temperatura y humedad", stock: "EN_STOCK", spec: "-40 a 80°C · ±2% HR · Digital", description: "Sensor digital de alta precisión para temperatura y humedad relativa. Comunicación por un solo cable, ideal para estaciones meteorológicas y riego automatizado.", photo: 3 },
  { name: "Sensor de Gas MQ-2", sku: "SEN-0202", price: 9, category: "Sensores", subcategory: "Gas", stock: "BAJO_PEDIDO", spec: "GLP/Humo/CO · Salida analógica", description: "Detecta gas licuado, humo y monóxido de carbono. Salida analógica proporcional a la concentración, con potenciómetro para ajustar la sensibilidad.", photo: 4 },
  { name: "Módulo IMU MPU6050", sku: "SEN-0415", price: 22, compareAtPrice: 29, category: "Sensores", subcategory: "Posición e inerciales", stock: "EN_STOCK", spec: "6 DoF · Acelerómetro + Giroscopio · I2C", description: "Combina acelerómetro y giroscopio de 3 ejes en un solo chip con comunicación I2C. Usado en drones, robots balanceadores y estabilizadores de cámara.", photo: 5 },
  { name: "Servomotor MG996R Torque Alto", sku: "ACT-0996", price: 28, compareAtPrice: 36, category: "Actuadores", subcategory: "Servomotores", stock: "EN_STOCK", spec: "10kg·cm · 4.8-7.2V · Engranaje metal", description: "Servomotor de torque alto con engranajes metálicos, más resistente que los de plástico. Ideal para brazos robóticos y proyectos que exigen fuerza y precisión.", photo: 6 },
  { name: "Micro Servomotor SG90", sku: "ACT-0990", price: 8, compareAtPrice: 11, category: "Actuadores", subcategory: "Servomotores", stock: "EN_STOCK", spec: "1.8kg·cm · 4.8-6V · 180°", description: "El micro servo más usado en proyectos escolares y prototipos rápidos. Liviano, económico y con rango de giro de 180°.", photo: 7 },
  { name: "Motor DC N20 con caja reductora", sku: "ACT-0120", price: 15, compareAtPrice: 20, category: "Actuadores", subcategory: "Motores DC", stock: "EN_STOCK", spec: "12V · 300RPM · Eje D 3mm", description: "Motor DC compacto con caja reductora integrada, entrega buen torque a bajas revoluciones. Muy usado en robots móviles pequeños y mecanismos de precisión.", photo: 8 },
  { name: "Motor Paso a Paso 28BYJ-48 + ULN2003", sku: "ACT-0428", price: 14, category: "Actuadores", subcategory: "Motores paso a paso", stock: "BAJO_PEDIDO", spec: "5V · 4 fases · Driver incluido", description: "Motor paso a paso de 5V con su placa driver ULN2003 incluida. Permite control preciso de posición, ideal para proyectos de CNC pequeños e instrumentación.", photo: 9 },
  { name: "Mini Bomba de Agua Sumergible", sku: "ACT-0512", price: 11, compareAtPrice: 15, category: "Actuadores", subcategory: "Bombas y válvulas", stock: "EN_STOCK", spec: "3-6V · 120L/h · Sumergible", description: "Bomba sumergible de bajo voltaje, perfecta para sistemas de riego automatizado, fuentes decorativas y proyectos de acuaponía a pequeña escala.", photo: 10 },
  { name: "Arduino UNO R3 (compatible)", sku: "CTR-0100", price: 32, category: "Controladores", subcategory: "Arduino", stock: "AGOTADO", spec: "ATmega328P · 14 I/O · USB-B", description: "La placa de desarrollo más popular para aprender electrónica y programación. Basada en ATmega328P, con 14 pines digitales y conexión USB-B.", photo: 11 },
  { name: "Arduino Nano (compatible)", sku: "CTR-0104", price: 22, category: "Controladores", subcategory: "Arduino", stock: "EN_STOCK", spec: "ATmega328P · Mini-USB · Compacto", description: "Versión compacta del Arduino UNO, ideal para proyectos donde el espacio es limitado. Misma potencia de procesamiento en un formato reducido.", photo: 12 },
  { name: "ESP32 DevKit V1 WiFi + BLE", sku: "CTR-3200", price: 35, compareAtPrice: 45, category: "Controladores", subcategory: "ESP32 / ESP8266", stock: "EN_STOCK", spec: "Dual-core · WiFi/BT · 30 pines", description: "Microcontrolador dual-core con WiFi y Bluetooth integrados, sucesor del ESP8266. La mejor opción para proyectos IoT que necesitan conectividad inalámbrica.", photo: 13 },
  { name: "Raspberry Pi 5 - 2GB", sku: "CTR-0500", price: 350, category: "Controladores", subcategory: "Raspberry Pi", stock: "AGOTADO", spec: "Quad-core · 2GB RAM · USB 3.0", description: "La computadora de placa reducida más potente de la familia Raspberry Pi. Ideal para servidores caseros, visión por computadora y proyectos de IA en el borde.", photo: 14 },
];

// Copia la foto de demo del frontend a uploads/ del backend y devuelve su URL
// relativa. Si el frontend no está al lado (o falta la foto), usa un placeholder.
const FRONTEND_PHOTOS = path.join(__dirname, "..", "..", "frontend", "public", "products");
const UPLOADS_PRODUCTS = path.join(__dirname, "..", "uploads", "products");

function seedPhotoUrl(n: number): string {
  const source = path.join(FRONTEND_PHOTOS, `producto${n}.jpg`);
  const target = path.join(UPLOADS_PRODUCTS, `seed-${n}.jpg`);
  try {
    fs.mkdirSync(UPLOADS_PRODUCTS, { recursive: true });
    fs.copyFileSync(source, target);
    return `/uploads/products/seed-${n}.jpg`;
  } catch {
    return "https://placehold.co/600x600?text=Foto+pendiente";
  }
}

// `SEED_MODE=admin` → solo crea/actualiza el usuario admin (para producción,
// donde el cliente arma su propio catálogo). Cualquier otro valor → siembra
// completa con datos de ejemplo (desarrollo local).
const ADMIN_ONLY = process.env.SEED_MODE === "admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@electrostock.pe";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin1234";

async function upsertAdmin() {
  console.log(`Creando/actualizando usuario admin (${ADMIN_EMAIL})…`);
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      name: "Admin AMYTRONICS",
      role: "ADMIN",
    },
  });
}

async function main() {
  if (ADMIN_ONLY) {
    await upsertAdmin();
    console.log("\nModo admin: sin datos de ejemplo. Catálogo vacío listo para el cliente.");
    return;
  }

  console.log("Sembrando categorías y subcategorías…");

  const categoryMap = new Map<string, { id: string; subs: Map<string, string> }>();

  for (const [i, cat] of categoriesSeed.entries()) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(cat.name) },
      update: {},
      create: {
        name: cat.name,
        slug: slugify(cat.name),
        description: cat.description,
        order: i,
      },
    });

    const subs = new Map<string, string>();
    for (const [j, subName] of cat.subcategories.entries()) {
      const sub = await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: slugify(subName) } },
        update: {},
        create: {
          name: subName,
          slug: slugify(subName),
          categoryId: category.id,
          order: j,
        },
      });
      subs.set(subName, sub.id);
    }
    categoryMap.set(cat.name, { id: category.id, subs });
  }

  await upsertAdmin();

  console.log(`Creando ${productsSeed.length} productos de ejemplo…`);
  for (const p of productsSeed) {
    const cat = categoryMap.get(p.category);
    const subcategoryId = cat?.subs.get(p.subcategory);
    if (!cat || !subcategoryId) {
      console.warn(`  ⚠ ${p.name}: categoría/subcategoría no encontrada, se omite.`);
      continue;
    }

    const slug = slugify(`${p.name}-${p.sku}`);
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        sku: p.sku,
        slug,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        categoryId: cat.id,
        subcategoryId,
        stock: p.stock,
        spec: p.spec,
        description: p.description,
        images: {
          create: [{ url: seedPhotoUrl(p.photo), order: 0 }],
        },
      },
    });
  }

  console.log("\nListo. Usuario admin: admin@electrostock.pe / admin1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
