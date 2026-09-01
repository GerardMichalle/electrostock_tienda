"use client";

import { useEffect, useRef } from "react";

/**
 * Visor 3D interactivo, 100% en el navegador y sin librerías: un pequeño
 * renderizador por software sobre <canvas> que muestra una pieza (engranaje)
 * "impresa" capa por capa. Se arrastra para girar y la rueda acerca/aleja.
 */

type Face = { idx: number[]; kind: "cap" | "outer" | "inner" };

/** Genera la malla de un engranaje extruido (eje = Y, imprime hacia arriba). */
function makeGear() {
  const teeth = 12;
  const outerR = 1.16;
  const rootR = 0.92;
  const boreR = 0.34;
  const half = 0.55; // media altura

  // perfil 2D (radios por vértice, en orden alrededor del círculo)
  const profR: number[] = [];
  const profA: number[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const step = (Math.PI * 2) / teeth;
    // valle -> flanco -> punta -> punta -> flanco -> valle
    profR.push(rootR, rootR, outerR, outerR);
    profA.push(a, a + step * 0.28, a + step * 0.36, a + step * 0.64);
  }
  const n = profR.length;

  const verts: number[][] = [];
  // 0..n-1  perfil superior | n..2n-1 perfil inferior
  for (let i = 0; i < n; i++)
    verts.push([Math.cos(profA[i]) * profR[i], half, Math.sin(profA[i]) * profR[i]]);
  for (let i = 0; i < n; i++)
    verts.push([Math.cos(profA[i]) * profR[i], -half, Math.sin(profA[i]) * profR[i]]);
  // 2n..3n-1 barreno superior | 3n..4n-1 barreno inferior
  for (let i = 0; i < n; i++)
    verts.push([Math.cos(profA[i]) * boreR, half, Math.sin(profA[i]) * boreR]);
  for (let i = 0; i < n; i++)
    verts.push([Math.cos(profA[i]) * boreR, -half, Math.sin(profA[i]) * boreR]);

  const faces: Face[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    faces.push({ idx: [i, j, 2 * n + j, 2 * n + i], kind: "cap" }); // tapa superior
    faces.push({ idx: [3 * n + i, 3 * n + j, n + j, n + i], kind: "cap" }); // tapa inferior
    faces.push({ idx: [n + i, n + j, j, i], kind: "outer" }); // pared exterior
    faces.push({ idx: [2 * n + i, 2 * n + j, 3 * n + j, 3 * n + i], kind: "inner" }); // pared del barreno
  }
  return { verts, faces, half };
}

const MESH = makeGear();

function rot(p: number[], cy: number, sy: number, cx: number, sx: number): number[] {
  const x1 = p[0] * cy + p[2] * sy;
  const z1 = -p[0] * sy + p[2] * cy;
  const y1 = p[1];
  const y2 = y1 * cx - z1 * sx;
  const z2 = y1 * sx + z1 * cx;
  return [x1, y2, z2];
}

export default function Printed3DViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0,
      h = 0,
      dpr = 1;
    let yaw = -0.6,
      pitch = -0.42,
      camDist = 3.7;
    let dragging = false,
      lastX = 0,
      lastY = 0,
      idleSpin = !reduced;
    let intro = reduced ? 1 : 0;
    let raf = 0;
    let startT = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const render = (t: number) => {
      if (!startT) startT = t;
      if (intro < 1) intro = Math.min(1, (t - startT) / 1100);
      const introE = 1 - Math.pow(1 - intro, 3); // easeOutCubic
      if (idleSpin && !dragging) yaw += 0.006;

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2 + h * 0.04;
      const focal = Math.min(w, h) * 0.62;
      const cyw = Math.cos(yaw),
        syw = Math.sin(yaw),
        cxw = Math.cos(pitch),
        sxw = Math.sin(pitch);

      // altura de impresión actual (barrido de abajo hacia arriba)
      const printY = -MESH.half + introE * (MESH.half * 2 + 0.02);

      type Poly = { pts: number[][]; depth: number; fill: string };
      const polys: Poly[] = [];

      for (const f of MESH.faces) {
        const local = f.idx.map((i) => MESH.verts[i]);
        // recorte por altura de impresión
        const minY = Math.min(...local.map((p) => p[1]));
        if (minY > printY) continue;

        const rv = local.map((p) => rot(p, cyw, syw, cxw, sxw));
        // centroide + normal (en espacio de vista)
        const c = [0, 0, 0];
        for (const p of rv) {
          c[0] += p[0] / rv.length;
          c[1] += p[1] / rv.length;
          c[2] += p[2] / rv.length;
        }
        const e1 = [rv[1][0] - rv[0][0], rv[1][1] - rv[0][1], rv[1][2] - rv[0][2]];
        const e2 = [rv[2][0] - rv[0][0], rv[2][1] - rv[0][1], rv[2][2] - rv[0][2]];
        const nx = e1[1] * e2[2] - e1[2] * e2[1];
        const ny = e1[2] * e2[0] - e1[0] * e2[2];
        const nz = e1[0] * e2[1] - e1[1] * e2[0];
        const nl = Math.hypot(nx, ny, nz) || 1;
        let n = [nx / nl, ny / nl, nz / nl];

        // orientamos la normal hacia la cámara (en (0,0,-camDist)); así la
        // malla hecha a mano no depende del orden de los vértices.
        const toCam = [-c[0], -c[1], -camDist - c[2]];
        if (n[0] * toCam[0] + n[1] * toCam[1] + n[2] * toCam[2] < 0)
          n = [-n[0], -n[1], -n[2]];

        // luz fija en espacio de vista (arriba-izq-frente)
        const L = [-0.34, 0.58, -0.74];
        let sh = 0.26 + 0.74 * Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);

        // líneas de capa en las paredes (efecto FDM)
        if (f.kind !== "cap") {
          const localCentroidY =
            local.reduce((s, p) => s + p[1], 0) / local.length;
          sh *= 0.9 + 0.1 * (0.5 + 0.5 * Math.sin(localCentroidY * 150));
        }
        sh = Math.max(0, Math.min(1, sh));

        // color: navy -> azul brillante según iluminación
        const base = [18, 46, 88];
        const hi = [70, 156, 214];
        let r = lerp(base[0], hi[0], sh) * (0.5 + 0.7 * sh);
        let g = lerp(base[1], hi[1], sh) * (0.5 + 0.7 * sh);
        let b = lerp(base[2], hi[2], sh) * (0.5 + 0.7 * sh);
        // borde recién impreso: brillo verde en la capa superior
        if (intro < 1 && Math.abs(minY - printY) < 0.12) {
          r = lerp(r, 120, 0.7);
          g = lerp(g, 210, 0.7);
          b = lerp(b, 90, 0.7);
        }

        // proyección
        const pts: number[][] = [];
        let ok = true;
        let depth = 0;
        for (const p of rv) {
          const zc = p[2] + camDist;
          if (zc < 0.06) {
            ok = false;
            break;
          }
          const s = focal / zc;
          pts.push([cx + p[0] * s, cy - p[1] * s]);
          depth += zc / rv.length;
        }
        if (!ok) continue;
        polys.push({
          pts,
          depth,
          fill: `rgb(${r | 0} ${g | 0} ${b | 0})`,
        });
      }

      polys.sort((a, b) => b.depth - a.depth); // lejos primero

      for (const poly of polys) {
        ctx.beginPath();
        ctx.moveTo(poly.pts[0][0], poly.pts[0][1]);
        for (let i = 1; i < poly.pts.length; i++)
          ctx.lineTo(poly.pts[i][0], poly.pts[i][1]);
        ctx.closePath();
        ctx.fillStyle = poly.fill;
        ctx.fill();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "rgba(10,22,45,0.35)";
        ctx.stroke();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    // --- interacción ---
    const onDown = (e: PointerEvent) => {
      dragging = true;
      idleSpin = false;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      yaw += (e.clientX - lastX) * 0.01;
      pitch = Math.max(-1.35, Math.min(1.35, pitch + (e.clientY - lastY) * 0.01));
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (!reduced) idleSpin = true;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camDist = Math.max(2.6, Math.min(7, camDist * (1 + e.deltaY * 0.0012)));
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full cursor-grab touch-none select-none active:cursor-grabbing"
      aria-label="Modelo 3D interactivo de un engranaje impreso"
    />
  );
}
