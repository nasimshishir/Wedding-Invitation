"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";

interface FloatingLight {
  id: number;
  x: number;
  label: string;
}

const PRESET_DUAS = [
  "BarakAllahu Lakuma",
  "Ameen · Lifetime of Barakah",
  "MashAllah · Warmest Wishes",
];

export function InteractiveBlessings({
  coupleNames,
}: {
  coupleNames: string;
}) {
  const [blessingCount, setBlessingCount] = useState(24);
  const [selectedDua, setSelectedDua] = useState<string>(PRESET_DUAS[0]);
  const [lights, setLights] = useState<FloatingLight[]>([]);
  const [sentNote, setSentNote] = useState(false);

  function sendBlessing(label: string) {
    setSelectedDua(label);
    setBlessingCount((c) => c + 1);
    setSentNote(true);

    const id = Date.now() + Math.random();
    const x = Math.round((Math.random() - 0.5) * 140);
    setLights((prev) => [...prev.slice(-8), { id, x, label }]);

    setTimeout(() => {
      setLights((prev) => prev.filter((item) => item.id !== id));
    }, 1800);
  }

  return (
    <div className="card-silk-surface relative overflow-hidden rounded-3xl border border-champagne-300/75 px-6 py-8 text-center sm:px-10">
      <p className="text-[11px] font-semibold tracking-[0.26em] text-champagne-600 uppercase">
        Send a Prayer &amp; Blessing
      </p>
      <h3 className="mt-2 font-serif text-2xl font-semibold text-espresso-900 sm:text-3xl">
        Offer a Dua for {coupleNames}
      </h3>
      <p className="mx-auto mt-1.5 max-w-md text-xs text-espresso-500">
        Tap a blessing below to send a lantern of dua for their new home
        together.
      </p>

      {/* Quick Dua Pills */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {PRESET_DUAS.map((dua) => (
          <button
            key={dua}
            type="button"
            onClick={() => sendBlessing(dua)}
            className={`rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
              selectedDua === dua && sentNote
                ? "border-champagne-500 bg-champagne-500/15 text-champagne-700"
                : "border-champagne-300/80 bg-ivory-50 text-espresso-700 hover:border-champagne-500 hover:bg-champagne-300/20"
            }`}
          >
            {dua}
          </button>
        ))}
      </div>

      {/* Interactive Main Tap Button + Floating Sparks */}
      <div className="relative mt-6 flex flex-col items-center">
        <div className="pointer-events-none absolute -top-6 flex justify-center">
          <AnimatePresence>
            {lights.map((light) => (
              <motion.div
                key={light.id}
                initial={{ opacity: 0, y: 0, x: light.x * 0.2, scale: 0.7 }}
                animate={{ opacity: [0, 1, 0], y: -90, x: light.x, scale: 1.05 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeOut" }}
                className="absolute inline-flex items-center gap-1 rounded-full border border-champagne-400/70 bg-ivory-50/95 px-3 py-1 text-[11px] font-semibold whitespace-nowrap text-champagne-700 shadow-sm"
              >
                <Sparkles className="h-3 w-3 text-champagne-500" />
                {light.label}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => sendBlessing(selectedDua)}
          className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-champagne-600 via-champagne-500 to-champagne-600 px-7 py-3 text-xs font-semibold tracking-[0.18em] text-ivory-50 uppercase shadow-md transition-transform active:scale-95 hover:brightness-105"
        >
          <Heart className="h-4 w-4 fill-current" />
          Send Blessing ({blessingCount})
        </button>
      </div>
    </div>
  );
}
