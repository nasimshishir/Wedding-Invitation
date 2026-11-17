"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarPlus,
  ChevronDown,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  MoonStar,
  Navigation,
  Palette,
  Phone,
  Rotate3d,
  Sparkles,
  Users,
  Utensils,
} from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";
import type { GuestRecord } from "@/types/guest";
import { SoundTogglePill, useAmbientChime } from "./AmbientChime";
import { CountdownTimer } from "./CountdownTimer";
import {
  BotanicalDivider,
  FloralCorner,
  FloatingPetals,
  WaxSealMonogram,
} from "./FloralArt";
import { GatefoldCover } from "./GatefoldCover";
import { InteractiveBlessings } from "./InteractiveBlessings";
import { RsvpSection } from "./RsvpSection";
import { ScratchRevealCard } from "./ScratchRevealCard";

function buildGoogleCalendarUrl(): string {
  const start = WEDDING_CONFIG.event.startIso
    .replace(/[-:]/g, "")
    .replace(/\+\d{2}:\d{2}$/, "");
  const end = WEDDING_CONFIG.event.endIso
    .replace(/[-:]/g, "")
    .replace(/\+\d{2}:\d{2}$/, "");
  const title = encodeURIComponent(
    `${WEDDING_CONFIG.couple.groomFirstName} & ${WEDDING_CONFIG.couple.brideFirstName} — ${WEDDING_CONFIG.event.title}`
  );
  const location = encodeURIComponent(
    `${WEDDING_CONFIG.event.venueName}, ${WEDDING_CONFIG.event.venueAddressLine1}`
  );
  const details = encodeURIComponent(
    "Nikah Ceremony followed by the Joint Wedding Reception & Dinner. Your presence and duas are warmly awaited."
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
}

function downloadIcsFile() {
  const formatUtc = (iso: string) =>
    new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Wedding Invitation//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@wedding-invitation`,
    `DTSTAMP:${formatUtc(new Date().toISOString())}`,
    `DTSTART:${formatUtc(WEDDING_CONFIG.event.startIso)}`,
    `DTEND:${formatUtc(WEDDING_CONFIG.event.endIso)}`,
    `SUMMARY:${WEDDING_CONFIG.couple.groomFirstName} & ${WEDDING_CONFIG.couple.brideFirstName} — ${WEDDING_CONFIG.event.title}`,
    `LOCATION:${WEDDING_CONFIG.event.venueName}, ${WEDDING_CONFIG.event.venueAddressLine1}`,
    "DESCRIPTION:Single-day celebration featuring the Sacred Nikah Ceremony followed by our Joint Wedding Reception & Dinner.",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "wedding-invitation.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const TIMELINE_ICONS = {
  sparkles: Sparkles,
  moon: MoonStar,
  utensils: Utensils,
  heart: Heart,
};

const TIMELINE_TIPS: Record<string, string> = {
  welcome:
    "Welcome tea, light refreshments, and family greetings in the courtyard lounge.",
  nikah:
    "Please be seated 10 minutes prior to the Khutbah-e-Nikah. Dedicated prayer space is available on site.",
  reception:
    "Both families host the celebratory dinner together—open seating and family tables will be guided by ushers.",
  farewell:
    "Heartfelt dua and send-off for the couple as they begin their new journey together.",
};

type SuiteTab = "schedule" | "venue" | "attire";

export function InvitationCard({
  initialGuest,
  previewMode = false,
}: {
  initialGuest: GuestRecord;
  previewMode?: boolean;
}) {
  const [guest, setGuest] = useState<GuestRecord>(initialGuest);
  const [gateOpen, setGateOpen] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<SuiteTab>("schedule");
  const [expandedTimelineId, setExpandedTimelineId] = useState<string>("nikah");
  const [selectedSwatchIdx, setSelectedSwatchIdx] = useState<number>(1);
  const trackedRef = useRef(false);

  const chime = useAmbientChime();

  const sideConfig = WEDDING_CONFIG.sides[guest.side];
  const isBrideSide = guest.side === "bride";

  const primaryName = isBrideSide
    ? WEDDING_CONFIG.couple.brideFirstName
    : WEDDING_CONFIG.couple.groomFirstName;
  const secondaryName = isBrideSide
    ? WEDDING_CONFIG.couple.groomFirstName
    : WEDDING_CONFIG.couple.brideFirstName;

  const primaryFullName = isBrideSide
    ? WEDDING_CONFIG.couple.brideFullName
    : WEDDING_CONFIG.couple.groomFullName;
  const secondaryFullName = isBrideSide
    ? WEDDING_CONFIG.couple.groomFullName
    : WEDDING_CONFIG.couple.brideFullName;

  // Record "Opened" status immediately when a guest loads their personal link
  useEffect(() => {
    if (previewMode || trackedRef.current) return;
    trackedRef.current = true;

    fetch("/api/track-open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: guest.slug }),
      keepalive: true,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { guest?: GuestRecord } | null) => {
        if (data?.guest) {
          setGuest(data.guest);
        }
      })
      .catch(() => {
        // Silent fail so guest viewing is never interrupted
      });
  }, [guest.slug, previewMode]);

  const activeSwatch =
    WEDDING_CONFIG.dressCode.swatches[selectedSwatchIdx] ??
    WEDDING_CONFIG.dressCode.swatches[0];

  return (
    <div className="relative min-h-screen pb-24">
      <FloatingPetals />

      <AnimatePresence>
        {!gateOpen ? (
          <GatefoldCover
            displayName={guest.displayName}
            sideLabel={sideConfig.label}
            isOpen={gateOpen}
            onStartAudio={chime.start}
            onOpen={() => setGateOpen(true)}
          />
        ) : null}
      </AnimatePresence>

      {gateOpen ? (
        <SoundTogglePill isPlaying={chime.isPlaying} onToggle={chime.toggle} />
      ) : null}

      <main className="relative z-10 mx-auto max-w-2xl px-4 pt-6 sm:px-6 sm:pt-10">
        {/* Hero Invitation with Deliberate 3D Keepsake Flip (No Cursor Wobble) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{
            opacity: gateOpen ? 1 : 0,
            y: gateOpen ? 0 : 18,
          }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="perspective-1800"
        >
          <motion.div
            animate={{ rotateY: isCardFlipped ? 180 : 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative w-full"
          >
            {/* Front Face: Formal Invitation */}
            <section
              className={`card-silk-surface backface-hidden relative overflow-hidden rounded-[2rem] border border-champagne-300/75 px-6 py-12 text-center sm:px-12 sm:py-16 ${
                isCardFlipped ? "pointer-events-none" : "pointer-events-auto"
              }`}
              style={{ transform: "rotateY(0deg)" }}
            >
              <FloralCorner position="top-left" className="absolute top-0 left-0 h-36 w-36 sm:h-44 sm:w-44" />
              <FloralCorner position="top-right" className="absolute top-0 right-0 h-36 w-36 sm:h-44 sm:w-44" />
              <FloralCorner position="bottom-left" className="absolute bottom-0 left-0 h-32 w-32 opacity-80 sm:h-40 sm:w-40" />
              <FloralCorner position="bottom-right" className="absolute right-0 bottom-0 h-32 w-32 opacity-80 sm:h-40 sm:w-40" />

              <div className="pointer-events-none absolute inset-3.5 rounded-[1.5rem] border border-champagne-400/35 sm:inset-5" />

              <div className="relative z-10 flex flex-col items-center">
                <p className="font-serif text-xl tracking-wide text-champagne-700 sm:text-2xl">
                  {WEDDING_CONFIG.couple.arabicGreeting}
                </p>
                <p className="mt-1 text-[11px] tracking-wider text-espresso-500">
                  {WEDDING_CONFIG.couple.bismillahTranslation}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-champagne-300/80 bg-ivory-100/85 px-4 py-1 text-[11px] font-semibold tracking-[0.22em] text-champagne-700 uppercase">
                  <span>{sideConfig.label}</span>
                  <span aria-hidden="true">·</span>
                  <span>Single-Day Celebration</span>
                </div>

                <div className="mt-6 space-y-1">
                  <p className="font-serif text-base italic text-espresso-500">
                    Assalamu Alaikum, {guest.displayName}
                  </p>
                  <p className="mx-auto max-w-md pt-2 text-sm leading-relaxed text-espresso-700">
                    <span className="font-semibold text-espresso-900">
                      {sideConfig.parentsLine}
                    </span>
                    <br />
                    {sideConfig.hostLead} the Nikah &amp; Mutual Wedding
                    Reception of {sideConfig.relationWord}
                  </p>
                </div>

                <div className="mt-7 mb-4">
                  <h1 className="champagne-foil-text font-script text-6xl leading-tight sm:text-7xl">
                    {primaryName}
                  </h1>
                  <p className="my-1 font-serif text-2xl italic text-champagne-600">
                    &amp;
                  </p>
                  <h2 className="champagne-foil-text font-script text-6xl leading-tight sm:text-7xl">
                    {secondaryName}
                  </h2>
                  <p className="mt-3 font-serif text-sm tracking-wide text-espresso-700">
                    {primaryFullName}{" "}
                    <span className="text-champagne-600">&amp;</span>{" "}
                    {secondaryFullName}
                  </p>
                  <p className="mt-1 text-xs text-espresso-500">
                    ({sideConfig.partnerRelationWord}{" "}
                    {sideConfig.otherParentsLine})
                  </p>
                </div>

                <BotanicalDivider className="my-5 w-full" />

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold tracking-[0.26em] text-champagne-700 uppercase">
                    {WEDDING_CONFIG.event.dayLabel}
                  </p>
                  <p className="font-serif text-3xl font-semibold text-espresso-900 sm:text-4xl">
                    {WEDDING_CONFIG.event.dateDisplay}
                  </p>
                  <p className="text-xs tracking-widest text-espresso-500 uppercase">
                    {WEDDING_CONFIG.event.hijriDateDisplay}
                  </p>
                  <p className="pt-2 font-serif text-lg font-medium text-espresso-700">
                    {WEDDING_CONFIG.event.venueName}
                  </p>
                  <p className="text-xs text-espresso-500">
                    {WEDDING_CONFIG.event.venueAddressLine1}
                  </p>
                </div>

                <p className="mt-6 max-w-md rounded-2xl border border-champagne-300/60 bg-ivory-50/75 px-5 py-3.5 font-serif text-sm italic leading-relaxed text-espresso-700">
                  {sideConfig.warmNote}
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href="#rsvp"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-champagne-600 via-champagne-500 to-champagne-600 px-7 py-3 text-xs font-semibold tracking-[0.2em] text-ivory-50 uppercase shadow-md transition hover:brightness-105"
                  >
                    Respond to Invitation
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsCardFlipped(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-champagne-400/80 bg-ivory-50/90 px-5 py-3 text-xs font-semibold tracking-[0.16em] text-champagne-700 uppercase shadow-xs transition hover:bg-champagne-300/30"
                  >
                    <Rotate3d className="h-3.5 w-3.5" />
                    View Guest Pass
                  </button>
                </div>
              </div>
            </section>

            {/* Back Face: Personal 3D Keepsake Pass */}
            <section
              className={`card-silk-surface backface-hidden absolute inset-0 flex flex-col items-center justify-between overflow-hidden rounded-[2rem] border border-champagne-400/80 px-6 py-12 text-center sm:px-12 sm:py-16 ${
                !isCardFlipped ? "pointer-events-none" : "pointer-events-auto"
              }`}
              style={{ transform: "rotateY(180deg)" }}
            >
              <FloralCorner position="top-left" className="absolute top-0 left-0 h-32 w-32 opacity-75" />
              <FloralCorner position="top-right" className="absolute top-0 right-0 h-32 w-32 opacity-75" />
              <FloralCorner position="bottom-left" className="absolute bottom-0 left-0 h-32 w-32 opacity-75" />
              <FloralCorner position="bottom-right" className="absolute right-0 bottom-0 h-32 w-32 opacity-75" />

              <div className="pointer-events-none absolute inset-4 rounded-[1.5rem] border-2 border-dashed border-champagne-400/45" />

              <div className="relative z-10 flex w-full max-w-md flex-col items-center">
                <WaxSealMonogram monogram={WEDDING_CONFIG.couple.monogram} />

                <p className="mt-6 text-[11px] font-semibold tracking-[0.28em] text-champagne-600 uppercase">
                  Personal Guest Pass
                </p>
                <h2 className="mt-2 font-serif text-3xl font-semibold text-espresso-900 sm:text-4xl">
                  {guest.displayName}
                </h2>
                <p className="mt-1 text-xs font-medium tracking-wider text-champagne-700 uppercase">
                  {sideConfig.label}
                </p>

                <BotanicalDivider className="my-6 w-full" />

                <div className="grid w-full grid-cols-2 gap-3 text-left">
                  <div className="rounded-2xl border border-champagne-300/75 bg-ivory-50/90 p-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-espresso-500 uppercase">
                      <Users className="h-3.5 w-3.5 text-champagne-600" />
                      Reserved Seats
                    </div>
                    <p className="mt-1.5 font-serif text-2xl font-semibold text-espresso-900">
                      {guest.maxSeats} {guest.maxSeats === 1 ? "Seat" : "Seats"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-champagne-300/75 bg-ivory-50/90 p-4">
                    <div className="text-[10px] font-semibold tracking-wider text-espresso-500 uppercase">
                      RSVP Status
                    </div>
                    <p className="mt-1.5 font-serif text-xl font-semibold text-champagne-700">
                      {guest.status === "Attending"
                        ? `Confirmed (${guest.attendingCount})`
                        : guest.status === "Declined"
                        ? "Unable to Attend"
                        : "Awaiting Reply"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 w-full rounded-2xl border border-champagne-300/70 bg-ivory-50/85 px-5 py-4 text-center">
                  <p className="font-serif text-lg text-champagne-700">
                    بَارَكَ اللَّهُ لَكُمَا وَبَارَكَ عَلَيْكُمَا وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ
                  </p>
                  <p className="mt-1.5 text-xs italic text-espresso-500">
                    “May Allah bless you both, shower His blessings upon you,
                    and unite you together in goodness.”
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-7 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCardFlipped(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-champagne-400/80 bg-ivory-50 px-6 py-3 text-xs font-semibold tracking-[0.16em] text-champagne-700 uppercase shadow-xs transition hover:bg-champagne-300/30"
                >
                  <Rotate3d className="h-3.5 w-3.5" />
                  Back to Invitation
                </button>

                <a
                  href="#rsvp"
                  onClick={() => setIsCardFlipped(false)}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-champagne-600 via-champagne-500 to-champagne-600 px-6 py-3 text-xs font-semibold tracking-[0.18em] text-ivory-50 uppercase shadow-md transition hover:brightness-105"
                >
                  Confirm RSVP
                </a>
              </div>
            </section>
          </motion.div>
        </motion.div>

        {/* Interactive Gold-Foil Scratch Card */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          className="mt-8"
        >
          <ScratchRevealCard
            displayName={guest.displayName}
            maxSeats={guest.maxSeats}
          />
        </motion.section>

        {/* Quranic Verse */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55 }}
          className="card-silk-surface mt-8 rounded-3xl border border-champagne-300/65 px-6 py-8 text-center sm:px-10"
        >
          <p className="font-serif text-lg italic leading-relaxed text-espresso-700 sm:text-xl">
            {WEDDING_CONFIG.couple.quranicVerse}
          </p>
          <p className="mt-2.5 text-[11px] font-semibold tracking-[0.24em] text-champagne-700 uppercase">
            {WEDDING_CONFIG.couple.quranicReference}
          </p>
        </motion.section>

        {/* Interactive Stationery Suite Tabs (Schedule / Venue & Countdown / Attire Palette) */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55 }}
          className="card-silk-surface mt-8 overflow-hidden rounded-3xl border border-champagne-300/75 px-5 py-8 sm:px-9"
        >
          {/* Interactive Tab Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(
              [
                { id: "schedule", label: "01 · Day Schedule", icon: Clock },
                { id: "venue", label: "02 · Venue & Countdown", icon: MapPin },
                { id: "attire", label: "03 · Attire Palette", icon: Palette },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all ${
                    active
                      ? "border-champagne-500 bg-gradient-to-r from-champagne-600 to-champagne-500 text-ivory-50 shadow-sm"
                      : "border-champagne-300/80 bg-ivory-50/80 text-espresso-700 hover:border-champagne-400 hover:bg-champagne-300/20"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "schedule" ? (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mt-7"
              >
                <div className="text-center">
                  <h2 className="font-serif text-3xl font-semibold text-espresso-900">
                    One Joyful Day Together
                  </h2>
                  <p className="mx-auto mt-1.5 max-w-md text-xs text-espresso-500">
                    All guests are invited for the full day. Tap any milestone
                    below to expand notes &amp; tips.
                  </p>
                </div>

                <div className="relative mt-6 space-y-4 before:absolute before:top-4 before:bottom-4 before:left-5 before:w-px before:bg-champagne-300/80 sm:before:left-6">
                  {WEDDING_CONFIG.timeline.map((item) => {
                    const Icon = TIMELINE_ICONS[item.icon];
                    const isExpanded = expandedTimelineId === item.id;
                    return (
                      <div key={item.id} className="relative flex gap-4">
                        <div
                          className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors sm:h-12 sm:w-12 ${
                            isExpanded
                              ? "border-champagne-500 bg-champagne-500 text-ivory-50"
                              : "border-champagne-400/75 bg-ivory-50 text-champagne-600"
                          }`}
                        >
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedTimelineId(isExpanded ? "" : item.id)
                          }
                          className={`flex-1 rounded-2xl border p-4 text-left transition-colors ${
                            isExpanded
                              ? "border-champagne-400 bg-ivory-50 shadow-sm"
                              : "border-champagne-300/60 bg-ivory-50/75 hover:border-champagne-400"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-champagne-700 uppercase">
                              <Clock className="h-3.5 w-3.5" />
                              {item.time}
                            </span>
                            <ChevronDown
                              className={`h-4 w-4 text-champagne-600 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </div>
                          <h3 className="mt-1 font-serif text-xl font-semibold text-espresso-900">
                            {item.title}
                          </h3>
                          <p className="mt-0.5 text-xs text-espresso-500">
                            {item.description}
                          </p>

                          <AnimatePresence>
                            {isExpanded ? (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-3 rounded-xl border border-champagne-300/60 bg-ivory-100/80 px-3.5 py-2.5 text-xs text-champagne-700">
                                  <strong>Guest Note:</strong>{" "}
                                  {TIMELINE_TIPS[item.id] ?? item.subtitle}
                                </div>
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}

            {activeTab === "venue" ? (
              <motion.div
                key="venue"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mt-7 text-center"
              >
                <p className="text-[11px] font-semibold tracking-[0.24em] text-champagne-600 uppercase">
                  Countdown to {WEDDING_CONFIG.event.dateDisplay}
                </p>
                <div className="mt-3">
                  <CountdownTimer targetIso={WEDDING_CONFIG.event.startIso} />
                </div>

                <BotanicalDivider className="my-6" />

                <h2 className="font-serif text-3xl font-semibold text-espresso-900">
                  {WEDDING_CONFIG.event.venueName}
                </h2>
                <p className="mt-1 text-sm font-medium text-champagne-700">
                  {WEDDING_CONFIG.event.venueHall}
                </p>
                <p className="mt-2 text-sm text-espresso-500">
                  {WEDDING_CONFIG.event.venueAddressLine1}
                  <br />
                  {WEDDING_CONFIG.event.venueAddressLine2}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={WEDDING_CONFIG.event.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-champagne-400/80 bg-ivory-50 px-5 py-2.5 text-xs font-semibold tracking-wider text-espresso-900 uppercase transition hover:bg-champagne-300/30"
                  >
                    <MapPin className="h-3.5 w-3.5 text-champagne-600" />
                    Google Maps
                  </a>
                  <a
                    href={WEDDING_CONFIG.event.appleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-champagne-400/80 bg-ivory-50 px-5 py-2.5 text-xs font-semibold tracking-wider text-espresso-900 uppercase transition hover:bg-champagne-300/30"
                  >
                    <Navigation className="h-3.5 w-3.5 text-champagne-600" />
                    Apple Maps
                  </a>
                  <a
                    href={buildGoogleCalendarUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-champagne-400/80 bg-ivory-50 px-5 py-2.5 text-xs font-semibold tracking-wider text-espresso-900 uppercase transition hover:bg-champagne-300/30"
                  >
                    <CalendarPlus className="h-3.5 w-3.5 text-champagne-600" />
                    Google Calendar
                  </a>
                  <button
                    type="button"
                    onClick={downloadIcsFile}
                    className="inline-flex items-center gap-2 rounded-full border border-champagne-400/80 bg-ivory-50 px-5 py-2.5 text-xs font-semibold tracking-wider text-espresso-900 uppercase transition hover:bg-champagne-300/30"
                  >
                    <CalendarPlus className="h-3.5 w-3.5 text-champagne-600" />
                    Apple / Outlook (.ics)
                  </button>
                </div>
              </motion.div>
            ) : null}

            {activeTab === "attire" ? (
              <motion.div
                key="attire"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="mt-7 text-center"
              >
                <h2 className="font-serif text-3xl font-semibold text-espresso-900">
                  {WEDDING_CONFIG.dressCode.subtitle}
                </h2>
                <p className="mx-auto mt-1.5 max-w-md text-xs text-espresso-500">
                  Tap any color swatch below to preview the fabric mood for the
                  day.
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
                  {WEDDING_CONFIG.dressCode.swatches.map((swatch, idx) => {
                    const selected = idx === selectedSwatchIdx;
                    return (
                      <button
                        key={swatch.name}
                        type="button"
                        onClick={() => setSelectedSwatchIdx(idx)}
                        className="flex flex-col items-center gap-1.5 focus:outline-none"
                      >
                        <span
                          className={`h-11 w-11 rounded-full border-2 transition-transform ${
                            selected
                              ? "scale-110 border-espresso-900 ring-2 ring-champagne-400 ring-offset-2 ring-offset-ivory-50"
                              : "border-champagne-400/70 hover:scale-105"
                          }`}
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <span
                          className={`text-[11px] font-medium ${
                            selected ? "text-espresso-900" : "text-espresso-500"
                          }`}
                        >
                          {swatch.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Live Fabric Mood Card */}
                <div
                  className="mx-auto mt-6 max-w-md rounded-2xl border border-champagne-400/60 p-6 transition-colors duration-300"
                  style={{
                    backgroundColor: activeSwatch.hex,
                    color:
                      activeSwatch.name === "Espresso" ? "#FAF6EE" : "#2B221C",
                  }}
                >
                  <p className="text-[10px] font-semibold tracking-[0.26em] uppercase opacity-80">
                    Selected Tone
                  </p>
                  <p className="mt-1 font-serif text-2xl font-semibold">
                    {activeSwatch.name}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed opacity-85">
                    {WEDDING_CONFIG.dressCode.description} Traditional modest
                    formal attire—such as panjabi, sherwani, saree, kameez, or
                    flowing evening silhouettes—pairs wonderfully with{" "}
                    {activeSwatch.name}.
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.section>

        {/* Interactive Blessings & Dua Wall */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="mt-8"
        >
          <InteractiveBlessings
            coupleNames={`${primaryName} & ${secondaryName}`}
          />
        </motion.section>

        {/* Personalized RSVP */}
        <div className="mt-8">
          <RsvpSection guest={guest} onUpdated={setGuest} />
        </div>

        {/* Side-Specific Family Coordinator Footer */}
        <footer className="mt-8 rounded-3xl border border-champagne-300/60 bg-ivory-50/75 px-6 py-7 text-center">
          <p className="text-[11px] font-semibold tracking-[0.24em] text-champagne-600 uppercase">
            {sideConfig.label} Point of Contact
          </p>
          <p className="mt-1.5 font-serif text-xl font-semibold text-espresso-900">
            {sideConfig.coordinatorName}
          </p>
          <p className="mt-1 text-xs text-espresso-500">
            Need help with directions, timing, or seating? Feel free to reach
            out.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${sideConfig.coordinatorPhone.replace(/\s+/g, "")}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-champagne-300 bg-ivory-100 px-4 py-2 text-xs font-medium text-espresso-700 hover:bg-champagne-300/30"
            >
              <Phone className="h-3.5 w-3.5 text-champagne-600" />
              {sideConfig.coordinatorPhone}
            </a>
            <a
              href={`https://wa.me/${sideConfig.coordinatorWhatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-champagne-300 bg-ivory-100 px-4 py-2 text-xs font-medium text-espresso-700 hover:bg-champagne-300/30"
            >
              <MessageCircle className="h-3.5 w-3.5 text-champagne-600" />
              WhatsApp Coordinator
            </a>
          </div>

          <p className="mt-6 font-serif text-sm italic text-espresso-500">
            Please remember {WEDDING_CONFIG.couple.groomFirstName} &amp;{" "}
            {WEDDING_CONFIG.couple.brideFirstName} in your prayers.
          </p>
        </footer>
      </main>
    </div>
  );
}
