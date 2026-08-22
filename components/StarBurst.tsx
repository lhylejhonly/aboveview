'use client';

import { useEffect, useRef } from 'react';

export default function StarBurst({ centerY = 58 }: { centerY?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    let width = 1;
    let height = 1;
    let frame = 0;
    let last = performance.now();
    let time = 0;
    const rays = Array.from({ length: 130 }, (_, index) => ({
      angle: (index / 130) * Math.PI * 2 + (Math.random() - 0.5) * 0.025,
      distance: Math.random(),
      speed: 0.12 + Math.random() * 0.16,
      length: 12 + Math.random() * 34,
      size: 0.5 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const draw = (now: number) => {
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      time += delta;
      const cx = width / 2;
      const cy = height * (centerY / 100);
      const radius = Math.sqrt(width * width + height * height);

      context.globalCompositeOperation = 'destination-out';
      context.globalAlpha = 0.16;
      context.fillStyle = '#000';
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      rays.forEach((ray) => {
        ray.distance += ray.speed * delta;
        if (ray.distance > 1.12) ray.distance = -Math.random() * 0.1;
        if (ray.distance < 0 || ray.distance > 1) return;
        const x = cx + Math.cos(ray.angle) * ray.distance * radius;
        const y = cy + Math.sin(ray.angle) * ray.distance * radius;
        const fade = ray.distance < 0.08 ? ray.distance / 0.08 : ray.distance > 0.84 ? (1 - ray.distance) / 0.16 : 1;
        const glow = 0.35 + Math.sin(time * 7 + ray.phase) * 0.18;
        const gold = ray.phase % 2 > 1 ? '255,255,255' : '212,180,131';

        context.globalAlpha = Math.max(0, fade * glow);
        context.strokeStyle = `rgb(${gold})`;
        context.lineWidth = ray.size;
        context.beginPath();
        context.moveTo(x - Math.cos(ray.angle) * ray.length, y - Math.sin(ray.angle) * ray.length);
        context.lineTo(x, y);
        context.stroke();
      });

      context.globalAlpha = 1;
      context.globalCompositeOperation = 'source-over';
      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [centerY]);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-70" />;
}
