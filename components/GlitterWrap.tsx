'use client';

import { useEffect, useRef } from 'react';

type Star = { x: number; y: number; z: number; speed: number; flash: number };

/** Lightweight storefront adaptation of the Originkit Glitter Wrap preset. */
export function GlitterWrap({ colors = ['#FFFFFF', '#D4B483', '#8E7551'] }: { colors?: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const stars: Star[] = [];
    let frame = 0;
    let width = 1;
    let height = 1;
    let lastTime = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const reset = (star: Star, initial = false) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.35 + Math.random() * 1.35;
      star.x = Math.cos(angle) * radius;
      star.y = Math.sin(angle) * radius;
      star.z = initial ? Math.random() : 1;
      star.speed = 0.7 + Math.random() * 0.7;
      star.flash = 0;
    };

    for (let i = 0; i < 1000; i += 1) {
      const star = { x: 0, y: 0, z: 0, speed: 1, flash: 0 };
      reset(star, true);
      stars.push(star);
    }

    const draw = (time: number) => {
      const delta = Math.min(0.1, Math.max(0.001, (time - lastTime) / 1000));
      lastTime = time;
      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.max(width, height) * 0.95;

      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = 'rgba(0, 0, 0, 0.14)';
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      stars.forEach((star, index) => {
        const previousZ = star.z;
        star.z -= delta * 0.014 * star.speed;
        if (star.z <= 0.07) reset(star);

        const perspective = 0.13 / Math.max(star.z, 0.001);
        const x = centerX + star.x * perspective * scale;
        const y = centerY + star.y * perspective * scale;
        if (x < -20 || x > width + 20 || y < -20 || y > height + 20) {
          reset(star);
          return;
        }

        const previousPerspective = 0.13 / Math.max(previousZ, 0.001);
        const previousX = centerX + star.x * previousPerspective * scale;
        const previousY = centerY + star.y * previousPerspective * scale;
        const life = Math.min(1, (1 - star.z) * 1.15);
        const size = Math.min(7, 0.7 + life * 4.6);
        const sparkle = Math.random() > 0.991;
        const alpha = Math.min(0.9, 0.16 + life * 0.65) * (sparkle ? 1.8 : 1);

        context.globalAlpha = alpha * 0.45;
        context.strokeStyle = colors[index % colors.length];
        context.lineWidth = Math.max(0.35, size * 0.35);
        context.beginPath();
        context.moveTo(previousX, previousY);
        context.lineTo(x, y);
        context.stroke();
        context.globalAlpha = alpha;
        context.fillStyle = colors[index % colors.length];
        context.fillRect(x - size / 2, y - size / 2, size, size);
        if (sparkle) {
          context.globalAlpha = alpha * 0.35;
          context.fillRect(x - size * 1.8, y - 0.35, size * 3.6, 0.7);
          context.fillRect(x - 0.35, y - size * 1.8, 0.7, size * 3.6);
        }
      });

      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
      frame = requestAnimationFrame(draw);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full pointer-events-none opacity-75" />;
}
