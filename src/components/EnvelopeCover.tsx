"use client";

import { motion } from "framer-motion";
import { MailOpen } from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";
import { BotanicalDivider, FloralCorner, WaxSealMonogram } from "./FloralArt";

interface EnvelopeCoverProps {
  displayName: string;
  sideLabel: string;
  isOpen: boolean;
  onOpen: () => void;
}

export function EnvelopeCover({
  displayName,
  sideLabel,
  isOpen,
  onOpen,
}: EnvelopeCoverProps) {
  if (isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-[#f6efe3]/95 p-4 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="card-silk-surface relative w-full max-w-md overflow-hidden rounded-[2rem] border border-champagne-300/70 px-7 py-11 text-center sm:px-10 sm:py-14"
      >
        <FloralCorner position="top-left" className="absolute top-0 left-0 h-32 w-32 opacity-85" />
        <FloralCorner position="top-right" className="absolute top-0 right-0 h-32 w-32 opacity-85" />
        <FloralCorner position="bottom-left" className="absolute bottom-0 left-0 h-28 w-28 opacity-75" />
        <FloralCorner position="bottom-right" className="absolute bottom-0 right-0 h-28 w-28 opacity-75" />

        <div className="relative z-10 flex flex-col items-center">
          <p className="font-serif text-lg tracking-wide text-champagne-700/90">
            {WEDDING_CONFIG.couple.arabicGreeting}
          </p>

          <p className="mt-4 text-[11px] font-semibold tracking-[0.28em] text-champagne-600 uppercase">
            Wedding Invitation · {sideLabel}
          </p>

          <BotanicalDivider className="my-5 w-full" />

          <p className="font-serif text-sm italic text-espresso-500">
            Assalamu Alaikum &amp; Warmest Greetings to
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-espresso-900 sm:text-4xl">
            {displayName}
          </h1>

          <p className="mt-4 max-w-xs text-xs leading-relaxed text-espresso-500">
            You are cordially invited to the Nikah &amp; Mutual Wedding Reception of{" "}
            <span className="font-semibold text-espresso-700">
              {WEDDING_CONFIG.couple.groomFirstName} &amp;{" "}
              {WEDDING_CONFIG.couple.brideFirstName}
            </span>
          </p>

          <motion.button
            type="button"
            onClick={onOpen}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="group mt-8 flex flex-col items-center gap-4 focus:outline-none"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <WaxSealMonogram monogram={WEDDING_CONFIG.couple.monogram} />
            </motion.div>

            <span className="inline-flex items-center gap-2 rounded-full border border-champagne-400/70 bg-ivory-50/90 px-6 py-2.5 text-xs font-semibold tracking-[0.18em] text-champagne-700 uppercase shadow-sm transition-colors group-hover:bg-champagne-500 group-hover:text-ivory-50">
              <MailOpen className="h-3.5 w-3.5" />
              Tap Seal to Open
            </span>
          </motion.button>

          <p className="mt-5 text-[11px] tracking-widest text-espresso-500/80 uppercase">
            {WEDDING_CONFIG.event.dateDisplay}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
