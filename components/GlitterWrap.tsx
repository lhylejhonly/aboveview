'use client';

import { useEffect, useRef } from 'react';

type GlitterColor = [number, number, number];
type Star = {
  x: number; y: number; z: number; px: number; py: number;
  seed: number; speed: number; colorIndex: number;
  flashUntil: number; nextFlash: number;
};

function parseColor(value: string): GlitterColor {
  const input = value.trim();
  if (input.startsWith('#')) {
    let hex = input.slice(1);
    if (hex.length === 3) hex = hex.split('').map((char) => char + char).join('');
    const number = Number.parseInt(hex, 16);
    return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
  }
  const match = input.match(/rgba?\(([^)]+)\)/i);
  if (match) {
    const parts = match[1].split(',').map((part) => Number.parseFloat(part.trim()));
    return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
  }
  return [255, 255, 255];
}

export function GlitterWrap({ colors = ['#FFFFFF', '#D4B483', '#FFE500'] }: { colors?: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!container || !canvas || !context) return;

    const palette = colors.map(parseColor);
    const stars: Star[] = [];
    const particleCount = 280;
    const speed = 0.014;
    const focalDepth = 0.13;
    let width = 1;
    let height = 1;
    let elapsed = 0;
    let lastTime = performance.now();

    const resetStar = (star: Star, initial = false) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.35 + Math.random() * 1.35;
      star.x = Math.cos(angle) * radius;
      star.y = Math.sin(angle) * radius;
      star.z = initial ? focalDepth + Math.random() * (1 - focalDepth) : 1;
      star.px = Number.NaN;
      star.py = Number.NaN;
      star.seed = Math.random() * 1000;
      star.speed = 0.6 + Math.random() * 0.8;
      star.colorIndex = Math.floor(Math.random() * palette.length);
      star.flashUntil = 0;
      star.nextFlash = elapsed + 1 + Math.random() * 3;
    };

    for (let index = 0; index < particleCount; index += 1) {
      const star = { x: 0, y: 0, z: 0, px: Number.NaN, py: Number.NaN, seed: 0, speed: 1, colorIndex: 0, flashUntil: 0, nextFlash: 0 };
      resetStar(star, true);
      stars.push(star);
    }

    const resize = (entry?: ResizeObserverEntry) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = entry?.contentRect;
      width = Math.max(1, Math.floor(rect?.width || container.clientWidth || 600));
      height = Math.max(1, Math.floor(rect?.height || container.clientHeight || 400));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
    };

    resize();
    const observer = new ResizeObserver((entries) => resize(entries[0]));
    observer.observe(container);

    const draw = (time: number) => {
      const delta = Math.min(0.1, Math.max(0.001, (time - lastTime) / 1000));
      lastTime = time;
      elapsed += delta;
      const dt = delta * 60;
      const centerX = width / 2;
      const centerY = height / 2;
      const projectionScale = Math.max(width, height) * 0.95;

      context.globalCompositeOperation = 'destination-out';
      context.globalAlpha = 0.16;
      context.fillStyle = '#000000';
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      stars.forEach((star) => {
        star.z -= speed * star.speed * dt;
        if (star.z <= focalDepth) {
          resetStar(star);
          return;
        }

        const perspective = focalDepth / Math.max(star.z, 0.0001);
        const x = centerX + star.x * perspective * projectionScale;
        const y = centerY + star.y * perspective * projectionScale;
        if (x < -30 || x > width + 30 || y < -30 || y > height + 30) {
          resetStar(star);
          return;
        }

        if (elapsed >= star.nextFlash) {
          star.flashUntil = elapsed + 0.05 + Math.random() * 0.08;
          star.nextFlash = elapsed + 1 + Math.random() * 3;
        }
        const flashing = elapsed <= star.flashUntil;
        const life = Math.min(1, (1 - star.z) * 1.2);
        const radius = Math.min(7, 0.8 + life * 4.8) * (flashing ? 1.5 : 1);
        const alpha = Math.min(0.95, 0.18 + life * 0.7) * (flashing ? 1.3 : 1);
        const color = palette[star.colorIndex % palette.length];
        const colorString = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

        if (!Number.isNaN(star.px)) {
          context.globalAlpha = alpha * 0.55;
          context.strokeStyle = colorString;
          context.lineWidth = Math.max(0.5, radius * 0.35);
          context.beginPath();
          context.moveTo(star.px, star.py);
          context.lineTo(x, y);
          context.stroke();
        }

        context.globalAlpha = alpha;
        context.fillStyle = colorString;
        context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        if (flashing) {
          context.globalAlpha = alpha * 0.45;
          context.fillRect(x - radius * 1.8, y - 0.5, radius * 3.6, 1);
          context.fillRect(x - 0.5, y - radius * 1.8, 1, radius * 3.6);
        }
        star.px = x;
        star.py = y;
      });

      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      observer.disconnect();
    };
  }, [colors]);

  return <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden opacity-80">
    <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
  </div>;
}
