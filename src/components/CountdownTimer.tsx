"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calculateTimeLeft(targetIso: string): TimeLeft {
  const diff = new Date(targetIso).getTime() - Date.now();
  if (Number.isNaN(diff) || diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
  };
}

export function CountdownTimer({ targetIso }: { targetIso: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetIso));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetIso));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetIso]);

  if (!timeLeft) {
    return (
      <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
        {["Days", "Hours", "Mins", "Secs"].map((label) => (
          <div
            key={label}
            className="rounded-2xl border border-champagne-300/60 bg-ivory-50/75 px-2 py-3 text-center"
          >
            <div className="font-serif text-2xl font-semibold text-espresso-900 sm:text-3xl">
              --
            </div>
            <div className="mt-0.5 text-[10px] font-medium tracking-[0.18em] text-espresso-500 uppercase">
              {label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (timeLeft.isPast) {
    return (
      <div className="rounded-2xl border border-champagne-300/70 bg-ivory-50/80 px-5 py-4 text-center font-serif text-lg italic text-champagne-700">
        The joyful day is here — Alhamdulillah!
      </div>
    );
  }

  const cells = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-4">
      {cells.map((cell) => (
        <div
          key={cell.label}
          className="rounded-2xl border border-champagne-300/60 bg-ivory-50/85 px-2 py-3 text-center shadow-[0_6px_18px_-10px_rgba(127,94,46,0.25)]"
        >
          <div className="font-serif text-2xl font-semibold text-espresso-900 tabular-nums sm:text-3xl">
            {String(cell.value).padStart(2, "0")}
          </div>
          <div className="mt-0.5 text-[10px] font-medium tracking-[0.18em] text-espresso-500 uppercase">
            {cell.label}
          </div>
        </div>
      ))}
    </div>
  );
}
