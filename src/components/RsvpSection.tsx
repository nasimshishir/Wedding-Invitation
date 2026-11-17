"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Edit3,
  HeartHandshake,
  Loader2,
  Minus,
  Plus,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import { WEDDING_CONFIG } from "@/config/wedding";
import type { GuestRecord } from "@/types/guest";

interface RsvpSectionProps {
  guest: GuestRecord;
  onUpdated: (updated: GuestRecord) => void;
}

export function RsvpSection({ guest, onUpdated }: RsvpSectionProps) {
  const alreadyResponded =
    guest.status === "Attending" || guest.status === "Declined";

  const [isEditing, setIsEditing] = useState(!alreadyResponded);
  const [attending, setAttending] = useState<boolean>(
    guest.status === "Declined" ? false : true
  );
  const [attendingCount, setAttendingCount] = useState<number>(
    guest.attendingCount > 0 ? guest.attendingCount : guest.maxSeats
  );
  const [phone, setPhone] = useState<string>(guest.phone || "");
  const [message, setMessage] = useState<string>(guest.message || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: guest.slug,
          attending,
          attendingCount: attending ? attendingCount : 0,
          phone,
          message,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        guest?: GuestRecord;
        error?: string;
      };

      if (!res.ok || !data.ok || !data.guest) {
        throw new Error(data.error || "Unable to save your response.");
      }

      onUpdated(data.guest);
      setIsEditing(false);
      setJustSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="rsvp"
      className="card-silk-surface relative overflow-hidden rounded-3xl border border-champagne-300/70 px-6 py-8 sm:px-10 sm:py-10"
    >
      <div className="text-center">
        <p className="text-[11px] font-semibold tracking-[0.26em] text-champagne-600 uppercase">
          Kindly Reply
        </p>
        <h2 className="mt-2 font-serif text-3xl font-semibold text-espresso-900 sm:text-4xl">
          RSVP for {guest.displayName}
        </h2>
        <p className="mt-2 text-sm text-espresso-500">
          Please respond by{" "}
          <span className="font-medium text-espresso-700">
            {WEDDING_CONFIG.event.rsvpDeadline}
          </span>
          . Both the Nikah &amp; Mutual Reception take place together on the same
          day.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-champagne-300/80 bg-ivory-100/90 px-4 py-1.5 text-xs font-medium text-champagne-700">
          <Users className="h-3.5 w-3.5" />
          <span>
            Reserved in your honor:{" "}
            <strong>
              {guest.maxSeats} {guest.maxSeats === 1 ? "seat" : "seats"}
            </strong>
          </span>
        </div>
      </div>

      {!isEditing && alreadyResponded ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-7 rounded-2xl border border-champagne-300/80 bg-ivory-50/90 p-6 text-center"
        >
          {guest.status === "Attending" ? (
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-champagne-300/35 text-champagne-700">
                {justSubmitted ? (
                  <Sparkles className="h-6 w-6" />
                ) : (
                  <CheckCircle2 className="h-6 w-6" />
                )}
              </div>
              <h3 className="mt-3 font-serif text-2xl font-semibold text-espresso-900">
                JazakAllahu Khayran — We Can&apos;t Wait to See You!
              </h3>
              <p className="mt-2 text-sm text-espresso-700">
                Confirmed for{" "}
                <span className="font-semibold text-champagne-700">
                  {guest.attendingCount}{" "}
                  {guest.attendingCount === 1 ? "guest" : "guests"}
                </span>{" "}
                for the full day (Nikah &amp; Reception).
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory-200 text-espresso-500">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="mt-3 font-serif text-2xl font-semibold text-espresso-900">
                Thank You for Letting Us Know
              </h3>
              <p className="mt-2 text-sm text-espresso-500">
                We will miss you dearly and kindly ask you to remember the couple
                in your duas.
              </p>
            </div>
          )}

          {guest.message ? (
            <blockquote className="mx-auto mt-4 max-w-md rounded-xl border border-champagne-300/50 bg-ivory-100/70 px-4 py-3 font-serif text-base italic text-espresso-700">
              “{guest.message}”
            </blockquote>
          ) : null}

          <button
            type="button"
            onClick={() => {
              setJustSubmitted(false);
              setIsEditing(true);
            }}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-champagne-400/70 px-4 py-2 text-xs font-medium text-champagne-700 transition-colors hover:bg-champagne-300/25"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Update Response
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-6">
          {/* Attendance decision */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setAttending(true)}
              className={`flex items-center justify-center gap-2.5 rounded-2xl border px-5 py-4 text-sm font-semibold transition-all ${
                attending
                  ? "border-champagne-500 bg-gradient-to-br from-champagne-500 to-champagne-600 text-ivory-50 shadow-md"
                  : "border-champagne-300/80 bg-ivory-50/75 text-espresso-700 hover:border-champagne-400"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Joyfully Accept
            </button>

            <button
              type="button"
              onClick={() => setAttending(false)}
              className={`flex items-center justify-center gap-2.5 rounded-2xl border px-5 py-4 text-sm font-semibold transition-all ${
                !attending
                  ? "border-espresso-700 bg-espresso-700 text-ivory-50 shadow-md"
                  : "border-champagne-300/80 bg-ivory-50/75 text-espresso-700 hover:border-champagne-400"
              }`}
            >
              <XCircle className="h-4 w-4" />
              Regretfully Decline
            </button>
          </div>

          {/* Seat selector when attending */}
          {attending ? (
            <div className="rounded-2xl border border-champagne-300/70 bg-ivory-50/85 p-5">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="text-center sm:text-left">
                  <label className="block text-sm font-semibold text-espresso-900">
                    How many guests will be attending?
                  </label>
                  <p className="mt-0.5 text-xs text-espresso-500">
                    Select between 1 and {guest.maxSeats} reserved{" "}
                    {guest.maxSeats === 1 ? "seat" : "seats"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Decrease guest count"
                    onClick={() =>
                      setAttendingCount((c) => Math.max(1, c - 1))
                    }
                    disabled={attendingCount <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne-400/70 bg-ivory-100 text-espresso-900 transition hover:bg-champagne-300/40 disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>

                  <span className="min-w-10 text-center font-serif text-3xl font-semibold text-espresso-900 tabular-nums">
                    {attendingCount}
                  </span>

                  <button
                    type="button"
                    aria-label="Increase guest count"
                    onClick={() =>
                      setAttendingCount((c) => Math.min(guest.maxSeats, c + 1))
                    }
                    disabled={attendingCount >= guest.maxSeats}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-champagne-400/70 bg-ivory-100 text-espresso-900 transition hover:bg-champagne-300/40 disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* Contact & Dua/Wishes */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="rsvp-phone"
                className="mb-1.5 block text-xs font-semibold tracking-wider text-espresso-700 uppercase"
              >
                Phone / WhatsApp (Optional)
              </label>
              <input
                id="rsvp-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="For any day-of updates"
                className="w-full rounded-xl border border-champagne-300/80 bg-ivory-50/90 px-4 py-3 text-sm text-espresso-900 placeholder:text-espresso-500/60 focus:border-champagne-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="rsvp-message"
                className="mb-1.5 block text-xs font-semibold tracking-wider text-espresso-700 uppercase"
              >
                Warm Wishes or Dua for the Couple (Optional)
              </label>
              <textarea
                id="rsvp-message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share a prayer or note for the bride and groom..."
                className="w-full rounded-xl border border-champagne-300/80 bg-ivory-50/90 px-4 py-3 text-sm text-espresso-900 placeholder:text-espresso-500/60 focus:border-champagne-500 focus:outline-none"
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-center text-xs font-medium text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-champagne-600 via-champagne-500 to-champagne-600 px-8 py-3.5 text-xs font-semibold tracking-[0.2em] text-ivory-50 uppercase shadow-lg transition hover:brightness-105 disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Response...
                </>
              ) : (
                "Confirm RSVP"
              )}
            </button>

            {alreadyResponded ? (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-xs font-medium text-espresso-500 underline-offset-4 hover:underline"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      )}
    </section>
  );
}
