"use client";

import { motion } from "framer-motion";

export function FloralCorner({
  position = "top-left",
  className = "",
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}) {
  const transformMap = {
    "top-left": "",
    "top-right": "scale-x-[-1]",
    "bottom-left": "scale-y-[-1]",
    "bottom-right": "scale-[-1]",
  };

  return (
    <svg
      viewBox="0 0 220 220"
      fill="none"
      aria-hidden="true"
      className={`pointer-events-none select-none ${transformMap[position]} ${className}`}
    >
      {/* Delicate gold stems */}
      <path
        d="M12 185C24 132 54 88 106 54C135 35 166 24 198 18"
        stroke="#C5A067"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M18 140C38 118 68 102 108 92"
        stroke="#C5A067"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.55"
      />

      {/* Sage & Champagne leaves */}
      <path
        d="M52 126C38 112 32 95 40 82C54 88 64 105 52 126Z"
        fill="#CBD2C3"
        fillOpacity="0.65"
        stroke="#95A08B"
        strokeWidth="0.9"
      />
      <path
        d="M84 96C72 78 72 60 85 50C98 60 100 80 84 96Z"
        fill="#E8D8BE"
        fillOpacity="0.75"
        stroke="#C5A067"
        strokeWidth="0.9"
      />
      <path
        d="M126 62C122 44 128 28 144 24C150 38 144 54 126 62Z"
        fill="#CBD2C3"
        fillOpacity="0.6"
        stroke="#95A08B"
        strokeWidth="0.9"
      />
      <path
        d="M72 134C88 124 106 124 116 135C102 146 84 146 72 134Z"
        fill="#E9DAC2"
        fillOpacity="0.65"
        stroke="#C5A067"
        strokeWidth="0.9"
      />

      {/* Primary Ivory Peony Bloom */}
      <g transform="translate(52, 54)">
        <circle cx="0" cy="0" r="24" fill="#FBF7EF" stroke="#D2B483" strokeWidth="1.1" />
        <path
          d="M-18 -6C-14 -20 6 -22 14 -10C22 2 14 18 0 19C-14 20 -22 8 -18 -6Z"
          fill="#FFFDF9"
          stroke="#C8A56E"
          strokeWidth="1"
        />
        <path
          d="M-11 -3C-8 -13 6 -14 11 -5C15 3 9 13 -1 12C-10 12 -14 5 -11 -3Z"
          fill="#F5E9D6"
          stroke="#C5A067"
          strokeWidth="0.9"
        />
        <circle cx="0" cy="0" r="4.5" fill="#D5B073" opacity="0.85" />
        <circle cx="-4" cy="-3" r="1.4" fill="#A67F44" />
        <circle cx="4" cy="-2" r="1.4" fill="#A67F44" />
        <circle cx="1" cy="4" r="1.4" fill="#A67F44" />
      </g>

      {/* Secondary Champagne Rosebud */}
      <g transform="translate(106, 36)">
        <circle cx="0" cy="0" r="14" fill="#F7EBD8" stroke="#C8A56E" strokeWidth="1" />
        <path
          d="M-9 -2C-6 -10 5 -10 8 -2C10 5 4 10 -3 9C-8 8 -11 3 -9 -2Z"
          fill="#FFFBF3"
          stroke="#C5A067"
          strokeWidth="0.85"
        />
        <circle cx="0" cy="0" r="2.8" fill="#C69D5E" />
      </g>

      {/* Tertiary Blossom */}
      <g transform="translate(32, 114)">
        <circle cx="0" cy="0" r="12" fill="#FFFDF9" stroke="#C8A56E" strokeWidth="1" />
        <circle cx="0" cy="0" r="6" fill="#EFE0C6" stroke="#C5A067" strokeWidth="0.8" />
        <circle cx="0" cy="0" r="2.2" fill="#B58E52" />
      </g>

      {/* Tiny champagne buds */}
      <circle cx="158" cy="24" r="3.5" fill="#DFC59B" stroke="#B78F52" strokeWidth="0.8" />
      <circle cx="176" cy="20" r="2.4" fill="#DFC59B" />
      <circle cx="22" cy="152" r="3.2" fill="#DFC59B" stroke="#B78F52" strokeWidth="0.8" />
      <circle cx="16" cy="170" r="2.2" fill="#DFC59B" />
    </svg>
  );
}

export function BotanicalDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent via-champagne-400/60 to-champagne-500/80" />
      <svg viewBox="0 0 64 24" className="h-5 w-14 text-champagne-500" fill="none">
        <path
          d="M32 4C34.5 9 34.5 15 32 20C29.5 15 29.5 9 32 4Z"
          fill="#DFC8A2"
          stroke="#A88450"
          strokeWidth="1"
        />
        <path
          d="M30 12C24 8 17 8 12 12C17 16 24 16 30 12Z"
          fill="#EFE2CC"
          stroke="#B8935A"
          strokeWidth="0.9"
        />
        <path
          d="M34 12C40 8 47 8 52 12C47 16 40 16 34 12Z"
          fill="#EFE2CC"
          stroke="#B8935A"
          strokeWidth="0.9"
        />
        <circle cx="6" cy="12" r="1.5" fill="#C5A067" />
        <circle cx="58" cy="12" r="1.5" fill="#C5A067" />
      </svg>
      <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent via-champagne-400/60 to-champagne-500/80" />
    </div>
  );
}

export function WaxSealMonogram({ monogram }: { monogram: string }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <div className="absolute -inset-2 rounded-full bg-champagne-400/20 blur-md" />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-champagne-300/80 bg-gradient-to-br from-[#e7cfab] via-[#c7a063] to-[#98723a] shadow-[0_10px_28px_rgba(127,94,46,0.38),inset_0_2px_6px_rgba(255,250,240,0.65)]">
        <div className="flex h-19 w-19 items-center justify-center rounded-full border border-ivory-100/50 bg-gradient-to-tl from-[#a98144]/40 to-transparent">
          <span className="font-script text-2xl tracking-wide text-ivory-50 drop-shadow-[0_1px_2px_rgba(65,46,20,0.45)]">
            {monogram}
          </span>
        </div>
      </div>
    </div>
  );
}

const PETALS = [
  { id: 1, left: "8%", delay: 0, duration: 13, size: 12 },
  { id: 2, left: "22%", delay: 2.5, duration: 15, size: 10 },
  { id: 3, left: "41%", delay: 5, duration: 14, size: 14 },
  { id: 4, left: "63%", delay: 1.4, duration: 16, size: 11 },
  { id: 5, left: "79%", delay: 3.8, duration: 13.5, size: 13 },
  { id: 6, left: "91%", delay: 6.2, duration: 15.5, size: 10 },
];

export function FloatingPetals() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {PETALS.map((petal) => (
        <motion.div
          key={petal.id}
          initial={{ y: -40, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: ["0vh", "105vh"],
            x: [0, 24, -18, 12],
            opacity: [0, 0.55, 0.45, 0],
            rotate: [0, 140, 280],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ left: petal.left }}
          className="absolute top-0"
        >
          <svg
            width={petal.size}
            height={petal.size * 1.4}
            viewBox="0 0 16 22"
            fill="none"
          >
            <path
              d="M8 1C12.5 5.5 14.5 11.5 12 16.5C10 20 6 20.5 3.5 17C1 13.5 2.5 6.5 8 1Z"
              fill="#EBD9BC"
              fillOpacity="0.7"
              stroke="#CFAF7B"
              strokeWidth="0.7"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
