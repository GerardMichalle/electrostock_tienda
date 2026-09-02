import "dotenv/config";
import { PrismaClient } from "@prisma/client";

/**
 * Deja el producto "Raspberry Pi 5 - 2GB" (SKU CTR-0500) completamente
 * detallado: ficha ampliada (info, ventajas, beneficios, aplicaciones,
 * especificaciones), video de YouTube y stock disponible. Sirve como ejemplo
 * para mostrarle al cliente todo lo que se puede cargar por producto.
 *
 *   npm run showcase:product        (backend/)
 *
 * Idempotente. Dev y producción comparten la base Neon.
 */

const prisma = new PrismaClient();

const SKU = "CTR-0500";
const VIDEO_URL = "https://www.youtube.com/embed/yul4gq_LrOI"; // "Introducing Raspberry Pi 5" (canal oficial)

const details = {
  info:
    "La Raspberry Pi 5 es una computadora completa del tamaño de una tarjeta de crédito. " +
    "Monta el procesador Broadcom BCM2712 con cuatro núcleos Arm Cortex-A76 a 2,4 GHz " +
    "—entre 2 y 3 veces más rápida que la Raspberry Pi 4— y un nuevo chip de entrada/salida " +
    "RP1 diseñado por Raspberry Pi que libera todo el ancho de banda de los puertos USB 3.0 " +
    "y de las cámaras. Esta versión trae 2 GB de RAM LPDDR4X, ideal para automatización, " +
    "servidores ligeros, cartelería digital y aprendizaje. Corre Raspberry Pi OS (Debian), " +
    "Ubuntu y miles de aplicaciones de Linux.",
  advantages: [
    {
      title: "Rendimiento de escritorio real",
      body:
        "Los cuatro núcleos Cortex-A76 a 2,4 GHz y la GPU VideoCore VII mueven el escritorio, " +
        "el navegador con varias pestañas y video 4K sin trabarse. Es la Raspberry Pi más rápida hasta la fecha.",
    },
    {
      title: "Chip RP1: puertos sin cuellos de botella",
      body:
        "El nuevo controlador de I/O RP1, diseñado en casa por Raspberry Pi, entrega el ancho de banda " +
        "completo de los dos USB 3.0 y de las dos interfaces de cámara/pantalla al mismo tiempo.",
    },
    {
      title: "Listo para NVMe",
      body:
        "Incluye un conector PCIe 2.0 ×1. Con una placa M.2 HAT opcional puedes arrancar el sistema " +
        "desde un SSD NVMe, mucho más rápido y confiable que una microSD.",
    },
    {
      title: "Botón de encendido y reloj en tiempo real",
      body:
        "Por primera vez trae botón de encendido/apagado y conector para pila del RTC, así el equipo " +
        "mantiene la hora aunque esté desconectado de la red.",
    },
  ],
  benefits: [
    "CPU de 64 bits hasta 3× más rápida que la Raspberry Pi 4",
    "Dos salidas micro-HDMI con soporte para doble pantalla 4K a 60 Hz",
    "Dos puertos USB 3.0 (5 Gbps) y dos USB 2.0",
    "Wi-Fi de doble banda (2,4 y 5 GHz) y Bluetooth 5.0 integrados",
    "Ethernet Gigabit con soporte PoE+ (con HAT opcional)",
    "Compatible con la mayoría de accesorios y HATs de 40 pines existentes",
    "Amplia comunidad y documentación oficial en español",
  ],
  applications: [
    "Servidor casero: archivos (NAS), Pi-hole, Home Assistant, Nextcloud",
    "Cartelería y kioscos digitales con reproducción 4K",
    "Automatización industrial ligera y adquisición de datos por GPIO",
    "Visión por computadora y edge AI con cámara MIPI",
    "Estación de retro-gaming y centro multimedia (Kodi)",
    "Laboratorio de programación y redes para colegios e institutos",
    "Prototipado de productos IoT antes de pasar a un módulo dedicado",
  ],
  techSpecs: [
    { label: "Procesador", value: "Broadcom BCM2712 · 4× Arm Cortex-A76 @ 2,4 GHz (64 bits)" },
    { label: "GPU", value: "VideoCore VII @ 800 MHz · OpenGL ES 3.1 · Vulkan 1.2" },
    { label: "Memoria RAM", value: "2 GB LPDDR4X-4267 SDRAM" },
    { label: "Chip de I/O", value: "RP1 (diseñado por Raspberry Pi)" },
    { label: "Video", value: "2× micro-HDMI · doble pantalla hasta 4Kp60 con HDR" },
    { label: "USB", value: "2× USB 3.0 (5 Gbps) · 2× USB 2.0" },
    {
      label: "Red",
      value:
        "Gigabit Ethernet (PoE+ con HAT) · Wi-Fi 802.11ac doble banda · Bluetooth 5.0 / BLE",
    },
    { label: "Cámara / pantalla", value: "2× conector MIPI de 4 carriles (cámara o display)" },
    {
      label: "Almacenamiento",
      value: "microSD (SDR104) · PCIe 2.0 ×1 para NVMe (HAT opcional)",
    },
    { label: "GPIO", value: "Cabezal estándar de 40 pines" },
    { label: "Extras", value: "Botón de encendido · conector para pila RTC · conector de ventilador PWM" },
    {
      label: "Alimentación",
      value: "5V / 5A DC vía USB-C (USB-PD). Funciona con 5V / 3A limitando periféricos",
    },
    { label: "Sistema operativo", value: "Raspberry Pi OS (Debian), Ubuntu y otras distribuciones de Linux" },
    { label: "Dimensiones", value: "85 × 56 × 17 mm · 45 g aprox." },
  ],
};

async function main() {
  const product = await prisma.product.findFirst({ where: { sku: SKU } });
  if (!product) {
    console.error(`No se encontró el producto ${SKU}. ¿Corriste el seed?`);
    process.exit(1);
  }

  await prisma.product.update({
    where: { id: product.id },
    data: {
      details,
      videoUrl: VIDEO_URL,
      stock: "EN_STOCK", // para que el ejemplo muestre el flujo de compra completo
    },
  });

  console.log(`"${product.name}" (${SKU}) actualizado:`);
  console.log(`  - ficha ampliada: ${details.advantages.length} ventajas, ${details.benefits.length} beneficios, ${details.applications.length} aplicaciones, ${details.techSpecs.length} especificaciones`);
  console.log(`  - video: ${VIDEO_URL}`);
  console.log(`  - stock: EN_STOCK`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
