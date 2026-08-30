export type Category = {
  slug: string;
  name: string;
  description: string;
  subcategories: { slug: string; name: string }[];
};

export const categories: Category[] = [
  {
    slug: "sensores",
    name: "Sensores",
    description: "Temperatura, distancia, gas, movimiento y más",
    subcategories: [
      { slug: "temperatura-humedad", name: "Temperatura y humedad" },
      { slug: "proximidad-distancia", name: "Proximidad y distancia" },
      { slug: "gas", name: "Gas" },
      { slug: "posicion-inerciales", name: "Posición e inerciales" },
      { slug: "camaras", name: "Cámaras" },
    ],
  },
  {
    slug: "actuadores",
    name: "Actuadores",
    description: "Motores, servos, bombas y válvulas",
    subcategories: [
      { slug: "motores-dc", name: "Motores DC" },
      { slug: "servomotores", name: "Servomotores" },
      { slug: "motores-paso-a-paso", name: "Motores paso a paso" },
      { slug: "bombas-valvulas", name: "Bombas y válvulas" },
    ],
  },
  {
    slug: "controladores",
    name: "Controladores",
    description: "Placas, microcontroladores y programadores",
    subcategories: [
      { slug: "arduino", name: "Arduino" },
      { slug: "esp32-esp8266", name: "ESP32 / ESP8266" },
      { slug: "raspberry-pi", name: "Raspberry Pi" },
      { slug: "plc", name: "PLC" },
    ],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getSubcategory(categorySlug: string, subSlug: string) {
  const cat = getCategory(categorySlug);
  return cat?.subcategories.find((s) => s.slug === subSlug);
}

export type Product = {
  slug: string;
  name: string;
  sku: string;
  price: number;
  categorySlug: string;
  subcategorySlug: string;
  stock: "En stock" | "Agotado" | "Bajo pedido";
  spec: string;
  image: string;
  description: string;
  gallery: string[];
  videoUrl?: string;
};

export const products: Product[] = [
  {
    slug: "sensor-ultrasonido-hc-sr04",
    name: "Sensor Ultrasónico HC-SR04",
    sku: "SEN-0104",
    price: 12,
    categorySlug: "sensores",
    subcategorySlug: "proximidad-distancia",
    stock: "En stock",
    spec: "2cm–400cm · 5V · Trigger/Echo",
    image: "sensor",
    gallery: ["sensor-1", "sensor-2", "sensor-3"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description:
      "Mide distancias entre 2cm y 400cm usando eco de ultrasonido. Ideal para robots evasores de obstáculos, medidores de nivel y proyectos de automatización. Funciona con 5V y se controla con dos pines: Trigger y Echo.",
  },
  {
    slug: "sensor-infrarrojo-ir",
    name: "Sensor de Proximidad Infrarrojo IR",
    sku: "SEN-0119",
    price: 6,
    categorySlug: "sensores",
    subcategorySlug: "proximidad-distancia",
    stock: "En stock",
    spec: "2cm–30cm · Salida digital",
    image: "sensor-ir",
    gallery: ["sensor-ir-1", "sensor-ir-2"],
    description:
      "Detecta objetos cercanos mediante infrarrojo, con salida digital lista para conectar a cualquier microcontrolador. Perfecto para robots seguidores de línea y sistemas de detección simple.",
  },
  {
    slug: "sensor-dht22",
    name: "Sensor de Temperatura y Humedad DHT22",
    sku: "SEN-0301",
    price: 18,
    categorySlug: "sensores",
    subcategorySlug: "temperatura-humedad",
    stock: "En stock",
    spec: "-40 a 80°C · ±2% HR · Digital",
    image: "dht22",
    gallery: ["dht22-1", "dht22-2"],
    description:
      "Sensor digital de alta precisión para temperatura y humedad relativa. Comunicación por un solo cable, ideal para estaciones meteorológicas y sistemas de riego automatizado.",
  },
  {
    slug: "sensor-gas-mq2",
    name: "Sensor de Gas MQ-2",
    sku: "SEN-0202",
    price: 9,
    categorySlug: "sensores",
    subcategorySlug: "gas",
    stock: "Bajo pedido",
    spec: "GLP/Humo/CO · Salida analógica",
    image: "gas",
    gallery: ["gas-1", "gas-2"],
    description:
      "Detecta gas licuado, humo y monóxido de carbono en el ambiente. Salida analógica proporcional a la concentración de gas, con potenciómetro para ajustar la sensibilidad.",
  },
  {
    slug: "modulo-mpu6050",
    name: "Módulo IMU MPU6050",
    sku: "SEN-0415",
    price: 22,
    categorySlug: "sensores",
    subcategorySlug: "posicion-inerciales",
    stock: "En stock",
    spec: "6 DoF · Acelerómetro + Giroscopio · I2C",
    image: "mpu6050",
    gallery: ["mpu6050-1", "mpu6050-2", "mpu6050-3"],
    description:
      "Combina acelerómetro y giroscopio de 3 ejes en un solo chip con comunicación I2C. Usado en drones, robots balanceadores y estabilizadores de cámara.",
  },
  {
    slug: "servomotor-mg996r",
    name: "Servomotor MG996R Torque Alto",
    sku: "ACT-0996",
    price: 28,
    categorySlug: "actuadores",
    subcategorySlug: "servomotores",
    stock: "En stock",
    spec: "10kg·cm · 4.8-7.2V · Engranaje metal",
    image: "servo",
    gallery: ["servo-1", "servo-2", "servo-3"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description:
      "Servomotor de torque alto con engranajes metálicos, más resistente que los de plástico. Ideal para brazos robóticos, direcciones de RC y proyectos que exigen fuerza y precisión.",
  },
  {
    slug: "servomotor-sg90",
    name: "Micro Servomotor SG90",
    sku: "ACT-0990",
    price: 8,
    categorySlug: "actuadores",
    subcategorySlug: "servomotores",
    stock: "En stock",
    spec: "1.8kg·cm · 4.8-6V · 180°",
    image: "servo-sg90",
    gallery: ["servo-sg90-1", "servo-sg90-2"],
    description:
      "El micro servo más usado en proyectos escolares y prototipos rápidos. Liviano, económico y con rango de giro de 180°.",
  },
  {
    slug: "motor-dc-12v-n20",
    name: "Motor DC N20 con caja reductora",
    sku: "ACT-0120",
    price: 15,
    categorySlug: "actuadores",
    subcategorySlug: "motores-dc",
    stock: "En stock",
    spec: "12V · 300RPM · Eje D 3mm",
    image: "motor",
    gallery: ["motor-1", "motor-2"],
    description:
      "Motor DC compacto con caja reductora integrada, entrega buen torque a bajas revoluciones. Muy usado en robots móviles pequeños y mecanismos de precisión.",
  },
  {
    slug: "motor-paso-a-paso-28byj48",
    name: "Motor Paso a Paso 28BYJ-48 + ULN2003",
    sku: "ACT-0428",
    price: 14,
    categorySlug: "actuadores",
    subcategorySlug: "motores-paso-a-paso",
    stock: "Bajo pedido",
    spec: "5V · 4 fases · Driver incluido",
    image: "stepper",
    gallery: ["stepper-1", "stepper-2"],
    description:
      "Motor paso a paso de 5V con su placa driver ULN2003 incluida. Permite control preciso de posición, ideal para proyectos de CNC pequeños e instrumentación.",
  },
  {
    slug: "bomba-agua-sumergible",
    name: "Mini Bomba de Agua Sumergible",
    sku: "ACT-0512",
    price: 11,
    categorySlug: "actuadores",
    subcategorySlug: "bombas-valvulas",
    stock: "En stock",
    spec: "3-6V · 120L/h · Sumergible",
    image: "bomba",
    gallery: ["bomba-1", "bomba-2"],
    description:
      "Bomba sumergible de bajo voltaje, perfecta para sistemas de riego automatizado, fuentes decorativas y proyectos de acuaponía a pequeña escala.",
  },
  {
    slug: "arduino-uno-r3",
    name: "Arduino UNO R3 (compatible)",
    sku: "CTR-0100",
    price: 32,
    categorySlug: "controladores",
    subcategorySlug: "arduino",
    stock: "Agotado",
    spec: "ATmega328P · 14 I/O · USB-B",
    image: "arduino",
    gallery: ["arduino-1", "arduino-2", "arduino-3"],
    description:
      "La placa de desarrollo más popular para aprender electrónica y programación. Basada en ATmega328P, con 14 pines digitales y conexión USB-B.",
  },
  {
    slug: "arduino-nano",
    name: "Arduino Nano (compatible)",
    sku: "CTR-0104",
    price: 22,
    categorySlug: "controladores",
    subcategorySlug: "arduino",
    stock: "En stock",
    spec: "ATmega328P · Mini-USB · Compacto",
    image: "arduino-nano",
    gallery: ["arduino-nano-1", "arduino-nano-2"],
    description:
      "Versión compacta del Arduino UNO, ideal para proyectos donde el espacio es limitado. Misma potencia de procesamiento en un formato reducido.",
  },
  {
    slug: "esp32-devkit-v1",
    name: "ESP32 DevKit V1 WiFi + BLE",
    sku: "CTR-3200",
    price: 35,
    categorySlug: "controladores",
    subcategorySlug: "esp32-esp8266",
    stock: "En stock",
    spec: "Dual-core · WiFi/BT · 30 pines",
    image: "esp32",
    gallery: ["esp32-1", "esp32-2", "esp32-3"],
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description:
      "Microcontrolador dual-core con WiFi y Bluetooth integrados, sucesor del ESP8266. La mejor opción para proyectos IoT que necesitan conectividad inalámbrica.",
  },
  {
    slug: "raspberry-pi-5-2gb",
    name: "Raspberry Pi 5 - 2GB",
    sku: "CTR-0500",
    price: 350,
    categorySlug: "controladores",
    subcategorySlug: "raspberry-pi",
    stock: "Agotado",
    spec: "Quad-core · 2GB RAM · USB 3.0",
    image: "raspberry",
    gallery: ["raspberry-1", "raspberry-2"],
    description:
      "La computadora de placa reducida más potente de la familia Raspberry Pi. Ideal para servidores caseros, visión por computadora y proyectos de IA en el borde.",
  },
];

export function getProductsByCategory(categorySlug: string) {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getProductsBySubcategory(
  categorySlug: string,
  subcategorySlug: string
) {
  return products.filter(
    (p) => p.categorySlug === categorySlug && p.subcategorySlug === subcategorySlug
  );
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, limit = 3) {
  return products
    .filter(
      (p) =>
        p.slug !== product.slug && p.subcategorySlug === product.subcategorySlug
    )
    .slice(0, limit);
}
