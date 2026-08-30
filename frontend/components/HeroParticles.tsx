"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; r: number };

const LINK_DIST = 150;
const POINTER_DIST = 200;

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let raf = 0;

    const pointer = { x: 0, y: 0, inside: false };
    let influence = 0; // eased 0..1 — how "awake" the field is

    const spawn = (): Particle => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22 - 0.04, // slight upward drift, like bubbles
      r: Math.random() * 1.8 + 1.2,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(
        40,
        Math.min(130, Math.round((width * height) / 10000)),
      );
      if (count !== particles.length) {
        particles = Array.from({ length: count }, spawn);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.inside =
        pointer.x >= 0 &&
        pointer.y >= 0 &&
        pointer.x <= width &&
        pointer.y <= height;
    };

    const onPointerOut = () => {
      pointer.inside = false;
    };

    const frame = () => {
      influence += ((pointer.inside ? 1 : 0) - influence) * 0.05;
      const awake = influence > 0.01;

      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        if (awake) {
          // cursor gently pushes particles aside, like a same-charge field
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > 1 && d2 < POINTER_DIST * POINTER_DIST) {
            const d = Math.sqrt(d2);
            const f = (1 - d / POINTER_DIST) * 0.05 * influence;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }

        // idle wander so it keeps drifting slowly on its own
        p.vx += (Math.random() - 0.5) * 0.014;
        p.vy += (Math.random() - 0.5) * 0.014;
        p.vx *= 0.98;
        p.vy *= 0.98;

        const sp = Math.hypot(p.vx, p.vy);
        const max = 0.33 + 0.8 * influence;
        if (sp > max) {
          p.vx = (p.vx / sp) * max;
          p.vy = (p.vy / sp) * max;
        }

        p.x += p.vx;
        p.y += p.vy;

        const m = 24;
        if (p.x < -m) p.x = width + m;
        else if (p.x > width + m) p.x = -m;
        if (p.y < -m) p.y = height + m;
        else if (p.y > height + m) p.y = -m;
      }

      // links between nearby particles
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            const base = (1 - d / LINK_DIST) * 0.16;
            ctx.strokeStyle = `rgba(255,255,255,${base * (1 + influence)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // links to the pointer + node glow
      for (const p of particles) {
        let glow = 0;
        if (awake) {
          const d = Math.hypot(pointer.x - p.x, pointer.y - p.y);
          if (d < POINTER_DIST) {
            const t = (1 - d / POINTER_DIST) * influence;
            glow = t;
            ctx.strokeStyle = `rgba(56,189,248,${0.55 * t})`;
            ctx.beginPath();
            ctx.moveTo(pointer.x, pointer.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + glow * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.45 * glow})`;
        ctx.fill();
      }

      if (!reduced && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (!document.hidden && !reduced) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(frame);
      }
    };

    resize();
    frame();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerOut);
    window.addEventListener("blur", onPointerOut);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerOut);
      window.removeEventListener("blur", onPointerOut);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
