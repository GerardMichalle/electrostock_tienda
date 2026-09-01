/**
 * Regenera todos los assets de marca de AMYTRONICS a partir del master
 *   frontend/src/img/logo_principal.png  (lockup del cliente, fondo blanco)
 *
 * Uso:  cd frontend && node scripts/gen-brand.js
 *
 * Salidas:
 *   src/img/logo.png        - lockup recortado, fondo blanco (solo referencia)
 *   src/img/logo-full.png   - lockup recortado, transparente        -> Footer
 *   src/img/logo-mark.png   - solo el icono "A" + LED, transparente  -> Header, admin
 *   app/icon.png            - icono 256, transparente
 *   app/apple-icon.png      - icono 180 sobre blanco con margen
 *   app/favicon.ico         - icono 16/32/48 (PNG dentro de ICO)
 *   app/opengraph-image.png - lockup centrado sobre blanco, 1200x630
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const IMG = path.join(__dirname, "..", "src", "img");
const APP = path.join(__dirname, "..", "app");

sharp.cache(false);
// El master se lee a memoria UNA vez: cada pipeline parte de este Buffer, nunca
// de la ruta. Si se reabre `sharp(ruta)` varias veces el cache de operaciones
// devuelve el recorte equivocado.
const MASTER = fs.readFileSync(path.join(IMG, "logo_principal.png"));

/** Convierte el fondo blanco -> alfa. Mantiene el color, solo desvanece el blanco. */
async function keyWhiteToAlpha(buf) {
  const { data, info } = await sharp(buf)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let p = 0; p < width * height; p++) {
    const i = p * channels;
    const d = Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2]);
    data[i + 3] = d <= 8 ? 0 : Math.min(255, Math.round(d * 1.18));
  }
  return sharp(data, { raw: { width, height, channels } }).png().toBuffer();
}

/** Centra buf en un lienzo cuadrado transparente con margen. */
async function squarePad(buf, pad = 0.08) {
  const { width, height } = await sharp(buf).metadata();
  const side = Math.round(Math.max(width, height) * (1 + pad * 2));
  return sharp({
    create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: buf, gravity: "center" }])
    .png()
    .toBuffer();
}

/** Centra buf (redimensionado a inner) en un lienzo cuadrado de color. */
async function squarePadColor(buf, side, inner, bg) {
  const glyph = await sharp(buf).resize(inner, inner, { fit: "inside" }).toBuffer();
  return sharp({ create: { width: side, height: side, channels: 4, background: bg } })
    .composite([{ input: glyph, gravity: "center" }])
    .png()
    .toBuffer();
}

/** Empaqueta varios PNG en un .ico (payloads PNG, 32bpp). sharp no escribe ICO. */
function buildIco(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2); // tipo: icono
  header.writeUInt16LE(count, 4);
  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  const bodies = [];
  pngs.forEach((p, idx) => {
    const b = idx * 16;
    dir.writeUInt8(p.size >= 256 ? 0 : p.size, b + 0);
    dir.writeUInt8(p.size >= 256 ? 0 : p.size, b + 1);
    dir.writeUInt16LE(1, b + 4); // planos
    dir.writeUInt16LE(32, b + 6); // bpp
    dir.writeUInt32LE(p.buf.length, b + 8);
    dir.writeUInt32LE(offset, b + 12);
    offset += p.buf.length;
    bodies.push(p.buf);
  });
  return Buffer.concat([header, dir, ...bodies]);
}

(async () => {
  // 1. Lockup completo recortado -----------------------------------------
  const lockup = await sharp(MASTER).trim({ background: "#ffffff", threshold: 12 }).toBuffer();
  const lockup1170 = await sharp(lockup).resize({ width: 1170 }).toBuffer();

  await sharp(lockup1170).flatten({ background: "#ffffff" }).png().toFile(path.join(IMG, "logo.png"));
  await sharp(await keyWhiteToAlpha(lockup1170)).toFile(path.join(IMG, "logo-full.png"));

  // 2. Icono "A" + LED (sin las pistas de circuito de la derecha) --------
  const iconRaw = await sharp(MASTER)
    .extract({ left: 486, top: 208, width: 398, height: 305 })
    .toBuffer();
  const iconKeyed = await keyWhiteToAlpha(iconRaw);
  const iconSquare = await squarePad(iconKeyed, 0.08);

  await sharp(iconSquare).resize(400, 400).png().toFile(path.join(IMG, "logo-mark.png"));
  await sharp(iconSquare).resize(256, 256).png().toFile(path.join(APP, "icon.png"));
  fs.writeFileSync(path.join(APP, "apple-icon.png"), await squarePadColor(iconKeyed, 180, 140, "#ffffff"));

  const icoPngs = [];
  for (const size of [16, 32, 48]) {
    icoPngs.push({ size, buf: await squarePadColor(iconKeyed, size, Math.round(size * 0.86), "#ffffff") });
  }
  fs.writeFileSync(path.join(APP, "favicon.ico"), buildIco(icoPngs));

  // 3. Open Graph 1200x630 ---------------------------------------------
  const ogInner = await sharp(lockup).resize({ width: 980 }).toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: "#ffffff" } })
    .composite([{ input: ogInner, gravity: "center" }])
    .png()
    .toFile(path.join(APP, "opengraph-image.png"));

  console.log("Assets de marca regenerados.");
})();
