"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarPlus,
  Clock,
  Heart,
  MapPin,
  MessageCircle,
  MoonStar,
  Navigation,
  Phone,
  Sparkles,
  Utensils,
} from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";
import type { GuestRecord } from "@/types/guest";
import { CountdownTimer } from "./CountdownTimer";
import { EnvelopeCover } from "./EnvelopeCover";
import { BotanicalDivider, FloralCorner, FloatingPetals } from "./FloralArt";
import { RsvpSection } from "./RsvpSection";

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

export function InvitationCard({
  initialGuest,
  previewMode = false,
}: {
  initialGuest: GuestRecord;
  previewMode?: boolean;
}) {
  const [guest, setGuest] = useState<GuestRecord>(initialGuest);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const trackedRef = useRef(false);

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

  return (
    <div className="relative min-h-screen pb-20">
      <FloatingPetals />

      <AnimatePresence>
        {!envelopeOpen ? (
          <EnvelopeCover
            displayName={guest.displayName}
            sideLabel={sideConfig.label}
            isOpen={envelopeOpen}
            onOpen={() => setEnvelopeOpen(true)}
          />
        ) : null}
      </AnimatePresence>

      <main className="relative z-10 mx-auto max-w-2xl px-4 pt-6 sm:px-6 sm:pt-10">
        {/* Hero Invitation Arch Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: envelopeOpen ? 1 : 0.2, y: envelopeOpen ? 0 : 20 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="card-silk-surface relative overflow-hidden rounded-[2rem] border border-champagne-300/75 px-6 py-12 text-center sm:px-12 sm:py-16"
        >
          <FloralCorner position="top-left" className="absolute top-0 left-0 h-36 w-36 sm:h-44 sm:w-44" />
          <FloralCorner position="top-right" className="absolute top-0 right-0 h-36 w-36 sm:h-44 sm:w-44" />
          <FloralCorner position="bottom-left" className="absolute bottom-0 left-0 h-32 w-32 opacity-80 sm:h-40 sm:w-40" />
          <FloralCorner position="bottom-right" className="absolute bottom-0 right-0 h-32 w-32 opacity-80 sm:h-40 sm:w-40" />

          {/* Inner champagne frame */}
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
                {sideConfig.hostLead} the Nikah &amp; Mutual Wedding Reception of{" "}
                {sideConfig.relationWord}
              </p>
            </div>

            {/* Couple Names */}
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
                ({sideConfig.partnerRelationWord} {sideConfig.otherParentsLine})
              </p>
            </div>

            <BotanicalDivider className="my-5 w-full" />

            {/* Date & Venue Summary */}
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

            <a
              href="#rsvp"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-champagne-600 via-champagne-500 to-champagne-600 px-7 py-3 text-xs font-semibold tracking-[0.2em] text-ivory-50 uppercase shadow-md transition hover:brightness-105"
            >
              Respond to Invitation
            </a>
          </div>
        </motion.section>

        {/* Quranic Blessing & Countdown */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.6 }}
          className="mt-8 space-y-6 text-center"
        >
          <div className="card-silk-surface rounded-3xl border border-champagne-300/65 px-6 py-8 sm:px-10">
            <p className="font-serif text-lg italic leading-relaxed text-espresso-700 sm:text-xl">
              {WEDDING_CONFIG.couple.quranicVerse}
            </p>
            <p className="mt-2.5 text-[11px] font-semibold tracking-[0.24em] text-champagne-700 uppercase">
              {WEDDING_CONFIG.couple.quranicReference}
            </p>
          </div>

          <div className="card-silk-surface rounded-3xl border border-champagne-300/65 px-6 py-7 sm:px-8">
            <p className="mb-4 text-[11px] font-semibold tracking-[0.26em] text-champagne-600 uppercase">
              Counting Down to Our Blessed Day
            </p>
            <CountdownTimer targetIso={WEDDING_CONFIG.event.startIso} />
          </div>
        </motion.section>

        {/* Single-Day Schedule: Nikah + Mutual Reception */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="card-silk-surface mt-8 rounded-3xl border border-champagne-300/70 px-6 py-9 sm:px-10"
        >
          <div className="text-center">
            <p className="text-[11px] font-semibold tracking-[0.26em] text-champagne-600 uppercase">
              Order of the Day
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-espresso-900 sm:text-4xl">
              One Joyful Day Together
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-espresso-500">
              All honored guests are warmly invited to join us throughout the
              day—from the sacred Nikah ceremony to our mutual reception dinner.
            </p>
          </div>

          <div className="relative mt-8 space-y-6 before:absolute before:top-3 before:bottom-3 before:left-5 before:w-px before:bg-champagne-300/80 sm:before:left-6">
            {WEDDING_CONFIG.timeline.map((item) => {
              const Icon = TIMELINE_ICONS[item.icon];
              return (
                <div key={item.id} className="relative flex gap-4 sm:gap-5">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-champagne-400/75 bg-ivory-50 text-champagne-600 shadow-sm sm:h-12 sm:w-12">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="flex-1 rounded-2xl border border-champagne-300/60 bg-ivory-50/80 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-champagne-700 uppercase">
                        <Clock className="h-3.5 w-3.5" />
                        {item.time}
                      </span>
                      <span className="text-[11px] font-medium text-espresso-500">
                        {item.subtitle}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-serif text-xl font-semibold text-espresso-900">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-espresso-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* Venue, Directions & Calendar */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="card-silk-surface mt-8 rounded-3xl border border-champagne-300/70 px-6 py-9 text-center sm:px-10"
        >
          <p className="text-[11px] font-semibold tracking-[0.26em] text-champagne-600 uppercase">
            Location &amp; Timing
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-espresso-900">
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

          <BotanicalDivider className="my-7" />

          {/* Dress Code */}
          <div>
            <p className="text-[11px] font-semibold tracking-[0.26em] text-champagne-600 uppercase">
              {WEDDING_CONFIG.dressCode.title}
            </p>
            <h3 className="mt-1 font-serif text-2xl font-semibold text-espresso-900">
              {WEDDING_CONFIG.dressCode.subtitle}
            </h3>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-espresso-500">
              {WEDDING_CONFIG.dressCode.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
              {WEDDING_CONFIG.dressCode.swatches.map((swatch) => (
                <div key={swatch.name} className="flex flex-col items-center gap-1.5">
                  <span
                    className="h-9 w-9 rounded-full border border-champagne-400/70 shadow-sm"
                    style={{ backgroundColor: swatch.hex }}
                    title={swatch.name}
                  />
                  <span className="text-[10px] font-medium tracking-wide text-espresso-500">
                    {swatch.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
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
            Need help with directions, timing, or seating? Feel free to reach out.
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
