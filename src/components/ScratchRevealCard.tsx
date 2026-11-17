"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Sparkles } from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";

interface ScratchRevealCardProps {
  displayName: string;
  maxSeats: number;
}

export function ScratchRevealCard({
  displayName,
  maxSeats,
}: ScratchRevealCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || revealed) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(280, Math.floor(rect.width));
    const height = Math.max(180, Math.floor(rect.height));

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Metallic champagne gold foil texture
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#E4CCA4");
    grad.addColorStop(0.35, "#C79F61");
    grad.addColorStop(0.65, "#E9D6B5");
    grad.addColorStop(1, "#B2884B");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle foil grain speckles
    for (let i = 0; i < 420; i++) {
      ctx.fillStyle =
        i % 2 === 0 ? "rgba(255,250,240,0.22)" : "rgba(120,86,38,0.12)";
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2.5 + 0.5,
        Math.random() * 2.5 + 0.5
      );
    }

    // Inner engraved frame
    ctx.strokeStyle = "rgba(255, 250, 240, 0.55)";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    // Prompt text etched on foil
    ctx.fillStyle = "#5D421C";
    ctx.font = "600 13px 'Plus Jakarta Sans', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("RUB OR SCRATCH GOLD FOIL TO REVEAL", width / 2, height / 2 - 6);
    ctx.font = "italic 14px 'Cormorant Garamond', serif";
    ctx.fillText("Your Reserved Date & Seat Pass", width / 2, height / 2 + 16);
  }, [revealed]);

  function scratchAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Sample cleared alpha pixels periodically
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    const step = 32;
    for (let i = 3; i < pixels.length; i += 4 * step) {
      if (pixels[i] < 128) transparent += 1;
    }
    const pct = Math.round((transparent / (pixels.length / (4 * step))) * 100);
    setProgress(pct);
    if (pct >= 42) {
      setRevealed(true);
    }
  }

  return (
    <div className="card-silk-surface rounded-3xl border border-champagne-300/75 px-6 py-7 text-center sm:px-8">
      <div className="flex items-center justify-center gap-2 text-[11px] font-semibold tracking-[0.24em] text-champagne-600 uppercase">
        <Sparkles className="h-3.5 w-3.5" />
        Interactive Save-the-Date Foil
      </div>
      <p className="mt-1 text-xs text-espresso-500">
        Scratch the champagne foil below with your finger or cursor
      </p>

      <div
        ref={containerRef}
        className="relative mx-auto mt-4 h-48 w-full max-w-md overflow-hidden rounded-2xl border border-champagne-400/75 bg-ivory-50 shadow-inner select-none"
      >
        {/* Underlying Secret Content */}
        <div className="flex h-full flex-col items-center justify-center px-5 py-4 text-center">
          <p className="text-[10px] font-semibold tracking-[0.26em] text-champagne-700 uppercase">
            Save the Blessed Date
          </p>
          <p className="mt-1 font-serif text-3xl font-semibold text-espresso-900">
            {WEDDING_CONFIG.event.dateDisplay}
          </p>
          <p className="text-xs tracking-widest text-espresso-500 uppercase">
            {WEDDING_CONFIG.event.hijriDateDisplay} · {WEDDING_CONFIG.event.venueName}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-champagne-300 bg-ivory-100 px-4 py-1 text-xs font-semibold text-champagne-700">
            {maxSeats} {maxSeats === 1 ? "Seat" : "Seats"} Reserved for{" "}
            {displayName}
          </div>
        </div>

        {/* Scratchable Foil Overlay */}
        {!revealed ? (
          <canvas
            ref={canvasRef}
            onPointerDown={(e) => {
              isDrawingRef.current = true;
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (!isDrawingRef.current) return;
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              isDrawingRef.current = false;
            }}
            onPointerCancel={() => {
              isDrawingRef.current = false;
            }}
            className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-0 bg-champagne-300/35"
          />
        )}
      </div>

      {!revealed ? (
        <div className="mt-3 flex items-center justify-center gap-4">
          <span className="text-[11px] text-espresso-500">
            {progress > 0 ? `${Math.min(100, Math.round((progress / 42) * 100))}% scratched` : "Waiting for your touch"}
          </span>
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-champagne-700 underline-offset-4 hover:underline"
          >
            <Eye className="h-3.5 w-3.5" />
            Reveal Instantly
          </button>
        </div>
      ) : (
        <p className="mt-3 text-xs font-medium text-champagne-700">
          Alhamdulillah — we look forward to welcoming you!
        </p>
      )}
    </div>
  );
}
