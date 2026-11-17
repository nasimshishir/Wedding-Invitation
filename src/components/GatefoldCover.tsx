"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { BotanicalDivider, FloralCorner, WaxSealMonogram } from "./FloralArt";

interface GatefoldCoverProps {
  displayName: string;
  sideLabel: string;
  isOpen: boolean;
  onOpen: () => void;
  onStartAudio: () => void;
}

export function GatefoldCover({
  displayName,
  sideLabel,
  isOpen,
  onOpen,
  onStartAudio,
}: GatefoldCoverProps) {
  const [stage, setStage] = useState<"closed" | "opening">("closed");

  if (isOpen) return null;

  function handleOpen() {
    if (stage !== "closed") return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(18);
    }
    onStartAudio();
    setStage("opening");
    setTimeout(() => {
      onOpen();
    }, 1180);
  }

  const isOpening = stage === "opening";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#f3eadc]/95 p-4 backdrop-blur-sm"
    >
      {/* Clean Architectural Gatefold Frame */}
      <div className="perspective-1800 relative h-[560px] w-full max-w-md sm:h-[600px]">
        {/* Inner Reveal Glow (visible as doors part) */}
        <motion.div
          animate={{
            opacity: isOpening ? 1 : 0.35,
            scale: isOpening ? 1 : 0.96,
          }}
          transition={{ duration: 0.9, delay: isOpening ? 0.25 : 0 }}
          className="card-silk-surface absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border border-champagne-300/80 px-8 text-center"
        >
          <p className="font-serif text-xl text-champagne-700">
            {WEDDING_CONFIG.couple.arabicGreeting}
          </p>
          <p className="champagne-foil-text mt-3 font-script text-5xl sm:text-6xl">
            {WEDDING_CONFIG.couple.groomFirstName} &amp;{" "}
            {WEDDING_CONFIG.couple.brideFirstName}
          </p>
          <p className="mt-2 text-xs font-semibold tracking-[0.26em] text-champagne-700 uppercase">
            {WEDDING_CONFIG.event.dateDisplay}
          </p>
          <p className="mt-4 font-serif text-base italic text-espresso-500">
            Welcome, {displayName}
          </p>
        </motion.div>

        {/* Left 3D Gatefold Door */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: isOpening ? -112 : 0 }}
          transition={{
            duration: 1.05,
            delay: isOpening ? 0.18 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
          }}
          className="linen-door-surface backface-hidden absolute top-0 bottom-0 left-0 z-10 w-1/2 overflow-hidden rounded-l-[2rem] border-y border-l border-champagne-400/75 shadow-[inset_-1px_0_0_rgba(190,151,91,0.35),0_24px_48px_-18px_rgba(95,70,35,0.22)]"
        >
          <FloralCorner position="top-left" className="absolute top-0 left-0 h-32 w-32 opacity-80" />
          <FloralCorner position="bottom-left" className="absolute bottom-0 left-0 h-28 w-28 opacity-75" />
          <div className="pointer-events-none absolute inset-y-4 right-0 left-4 rounded-l-[1.5rem] border-y border-l border-champagne-400/40" />
          {/* Horizontal silk ribbon half */}
          <div className="pointer-events-none absolute top-1/2 right-0 left-0 h-8 -translate-y-1/2 border-y border-champagne-400/45 bg-gradient-to-r from-[#edd9b8]/65 via-[#f6ead4]/90 to-[#dfc294]/80" />
        </motion.div>

        {/* Right 3D Gatefold Door */}
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: isOpening ? 112 : 0 }}
          transition={{
            duration: 1.05,
            delay: isOpening ? 0.18 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{
            transformOrigin: "right center",
            transformStyle: "preserve-3d",
          }}
          className="linen-door-surface backface-hidden absolute top-0 right-0 bottom-0 z-10 w-1/2 overflow-hidden rounded-r-[2rem] border-y border-r border-champagne-400/75 shadow-[inset_1px_0_0_rgba(190,151,91,0.35),0_24px_48px_-18px_rgba(95,70,35,0.22)]"
        >
          <FloralCorner position="top-right" className="absolute top-0 right-0 h-32 w-32 opacity-80" />
          <FloralCorner position="bottom-right" className="absolute right-0 bottom-0 h-28 w-28 opacity-75" />
          <div className="pointer-events-none absolute inset-y-4 right-4 left-0 rounded-r-[1.5rem] border-y border-r border-champagne-400/40" />
          {/* Horizontal silk ribbon half */}
          <div className="pointer-events-none absolute top-1/2 right-0 left-0 h-8 -translate-y-1/2 border-y border-champagne-400/45 bg-gradient-to-l from-[#edd9b8]/65 via-[#f6ead4]/90 to-[#dfc294]/80" />
        </motion.div>

        {/* Center Nameplate, Wax Seal & CTA (cleanly dissolves as doors unlatch) */}
        <motion.div
          animate={{
            opacity: isOpening ? 0 : 1,
            scale: isOpening ? 0.96 : 1,
          }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative z-20 flex h-full flex-col items-center justify-between px-8 py-12 text-center"
        >
          <div className="w-full">
            <p className="font-serif text-lg tracking-wide text-champagne-700">
              {WEDDING_CONFIG.couple.arabicGreeting}
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-champagne-400/65 bg-ivory-50/90 px-3.5 py-1 text-[10px] font-semibold tracking-[0.24em] text-champagne-700 uppercase shadow-xs">
              <Sparkles className="h-3 w-3" />
              {sideLabel}
            </div>
            <BotanicalDivider className="mx-auto mt-4 max-w-[220px]" />
            <p className="mt-3 font-serif text-sm italic text-espresso-500">
              Assalamu Alaikum &amp; Warmest Greetings to
            </p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-espresso-900 sm:text-4xl">
              {displayName}
            </h1>
          </div>

          {/* Center Wax Seal */}
          <button
            type="button"
            onClick={handleOpen}
            aria-label="Tap seal to open invitation"
            className="group flex flex-col items-center gap-5 focus:outline-none"
          >
            <div className="transition-transform duration-300 ease-out group-hover:scale-105 group-active:scale-95">
              <WaxSealMonogram monogram={WEDDING_CONFIG.couple.monogram} />
            </div>

            <span className="inline-flex items-center justify-center rounded-full border border-champagne-500/75 bg-ivory-50/95 px-7 py-2.5 text-xs font-semibold tracking-[0.2em] text-champagne-700 uppercase shadow-sm transition-colors duration-200 group-hover:bg-champagne-500 group-hover:text-ivory-50">
              Tap Seal to Open
            </span>
          </button>

          <div className="space-y-1">
            <p className="text-xs font-medium text-espresso-700">
              Nikah &amp; Mutual Wedding Reception
            </p>
            <p className="text-[11px] tracking-[0.2em] text-espresso-500 uppercase">
              {WEDDING_CONFIG.event.dateDisplay}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
