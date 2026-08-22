'use client';

import { useEffect, useRef } from 'react';

type Props = {
  color?: string;
  speed?: number;
  starCount?: number;
  opacity?: number;
};

function parseColor(value: string): [number, number, number] {
  const input = value.trim();
  if (input.startsWith('#')) {
    let hex = input.slice(1);
    if (hex.length === 3) hex = hex.split('').map((char) => char + char).join('');
    const number = Number.parseInt(hex, 16);
    return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
  }
  return [255, 255, 255];
}

type Pulse = { spoke: number; distance: number; speed: number; size: number; phase: number };

export default function StarBurst({ color = '#D4B483', speed = 10, starCount = 100, opacity = 0.65 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!container || !canvas || !context) return;

    const [red, green, blue] = parseColor(color);
    const spokes = Math.max(24, Math.min(180, Math.floor(starCount)));
    const pulses: Pulse[] = [];
    const pulsesPerSpoke = 12;
    let width = 1;
    let height = 1;
    let elapsed = 0;
    let lastTime = performance.now();

    for (let spoke = 0; spoke < spokes; spoke += 1) {
      for (let pulse = 0; pulse < pulsesPerSpoke; pulse += 1) {
        pulses.push({
          spoke,
          distance: Math.random() * 1.1,
          speed: 0.12 + Math.random() * 0.12,
          size: 0.7 + Math.random() * 0.8,
          phase: Math.random() * Math.PI * 2,
        });
      }
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
    };

    resize();
    const observer = new ResizeObserver((entries) => resize(entries[0]));
    observer.observe(container);

    const draw = (time: number) => {
      const delta = Math.min(0.05, Math.max(0.001, (time - lastTime) / 1000));
      lastTime = time;
      elapsed += delta;
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      const radius = Math.sqrt(width * width + height * height);

      // Transparent fade preserves the hero image while leaving subtle trails.
      context.globalCompositeOperation = 'destination-out';
      context.globalAlpha = 0.12;
      context.fillStyle = '#000';
      context.fillRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      const colorString = `rgb(${red}, ${green}, ${blue})`;
      pulses.forEach((pulse) => {
        pulse.distance += pulse.speed * (speed / 10) * delta;
        if (pulse.distance > 1.12) {
          pulse.distance = -Math.random() * 0.08;
          pulse.size = 0.7 + Math.random() * 0.8;
        }
        if (pulse.distance < 0 || pulse.distance > 1) return;

        const angle = (pulse.spoke / spokes) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * pulse.distance * radius;
        const y = centerY + Math.sin(angle) * pulse.distance * radius;
        const fade = pulse.distance < 0.08
          ? pulse.distance / 0.08
          : pulse.distance > 0.88 ? (1 - pulse.distance) / 0.12 : 1;
        const twinkle = 0.72 + Math.sin(elapsed * 8 + pulse.phase) * 0.28;
        const lineLength = (12 + pulse.speed * 55) * pulse.size;

        context.globalAlpha = Math.max(0, fade * twinkle * opacity);
        context.strokeStyle = colorString;
        context.lineWidth = Math.max(0.5, pulse.size * 0.8);
        context.beginPath();
        context.moveTo(x - Math.cos(angle) * lineLength, y - Math.sin(angle) * lineLength);
        context.lineTo(x, y);
        context.stroke();
        context.fillStyle = colorString;
        context.fillRect(x - pulse.size, y - pulse.size, pulse.size * 2, pulse.size * 2);
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
  }, [color, opacity, speed, starCount]);

  return <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
    <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
  </div>;
}
