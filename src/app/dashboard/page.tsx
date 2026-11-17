"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Eye,
  Lock,
  MailWarning,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import type {
  DashboardSummary,
  GuestRecord,
  GuestSide,
  GuestStatus,
} from "@/types/guest";

interface DashboardResponse {
  ok: boolean;
  mode: "google-sheets" | "local-demo";
  guests: GuestRecord[];
  summary: DashboardSummary;
  error?: string;
}

const STATUS_BADGE: Record<GuestStatus, string> = {
  "Not Opened": "border-stone-300 bg-stone-100 text-stone-700",
  Opened: "border-amber-300 bg-amber-50 text-amber-800",
  Attending: "border-emerald-300 bg-emerald-50 text-emerald-800",
  Declined: "border-rose-300 bg-rose-50 text-rose-800",
};

function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function DashboardPage() {
  const [passcode, setPasscode] = useState("");
  const [unlockedCode, setUnlockedCode] = useState<string | null>(null);
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<GuestStatus | "ALL">("ALL");
  const [sideFilter, setSideFilter] = useState<GuestSide | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Add Guest form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newSide, setNewSide] = useState<GuestSide>("groom");
  const [newMaxSeats, setNewMaxSeats] = useState(2);
  const [savingGuest, setSavingGuest] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (code: string) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/dashboard", {
        headers: { "x-host-passcode": code },
        cache: "no-store",
      });
      const json = (await res.json()) as DashboardResponse;
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Invalid passcode");
      }
      setData(json);
      setUnlockedCode(code);
      sessionStorage.setItem("wedding_host_passcode", code);
    } catch (err) {
      setUnlockedCode(null);
      setData(null);
      setAuthError(err instanceof Error ? err.message : "Failed to unlock");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem("wedding_host_passcode");
    if (saved) {
      setPasscode(saved);
      void fetchDashboard(saved);
    }
  }, [fetchDashboard]);

  const filteredGuests = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.guests.filter((g) => {
      if (statusFilter !== "ALL" && g.status !== statusFilter) return false;
      if (sideFilter !== "ALL" && g.side !== sideFilter) return false;
      if (
        q &&
        !g.displayName.toLowerCase().includes(q) &&
        !g.slug.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [data, search, sideFilter, statusFilter]);

  function getInviteUrl(slug: string): string {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/invite/${slug}`;
    }
    return `/invite/${slug}`;
  }

  async function copyText(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  }

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!unlockedCode) return;
    setSavingGuest(true);
    setAddError(null);

    try {
      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-host-passcode": unlockedCode,
        },
        body: JSON.stringify({
          displayName: newName,
          slug: newSlug || slugifyName(newName),
          side: newSide,
          maxSeats: newMaxSeats,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Could not add guest");
      }

      setNewName("");
      setNewSlug("");
      setNewMaxSeats(2);
      setShowAddForm(false);
      await fetchDashboard(unlockedCode);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to save guest");
    } finally {
      setSavingGuest(false);
    }
  }

  if (!unlockedCode || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void fetchDashboard(passcode);
          }}
          className="card-silk-surface w-full max-w-sm rounded-3xl border border-champagne-300/75 p-8 text-center"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-champagne-300/35 text-champagne-700">
            <Lock className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-serif text-3xl font-semibold text-espresso-900">
            Host Dashboard
          </h1>
          <p className="mt-1.5 text-xs text-espresso-500">
            Enter your family passcode to view RSVP counts, opened statuses, and
            generate guest links. (Demo passcode: <code>nikah2026</code>)
          </p>

          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter host passcode"
            required
            className="mt-5 w-full rounded-xl border border-champagne-300 bg-ivory-50 px-4 py-3 text-center text-sm text-espresso-900 focus:border-champagne-500 focus:outline-none"
          />

          {authError ? (
            <p className="mt-3 text-xs font-medium text-rose-700">{authError}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-full bg-gradient-to-r from-champagne-600 to-champagne-500 py-3 text-xs font-semibold tracking-[0.2em] text-ivory-50 uppercase shadow-md transition hover:brightness-105 disabled:opacity-60"
          >
            {loading ? "Checking..." : "Unlock Dashboard"}
          </button>

          <Link
            href="/"
            className="mt-4 inline-block text-xs text-espresso-500 hover:underline"
          >
            Back to Wedding Cover
          </Link>
        </form>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-3xl font-semibold text-espresso-900 sm:text-4xl">
              Guest &amp; RSVP Tracker
            </h1>
            <span className="rounded-full border border-champagne-400/70 bg-ivory-50 px-3 py-0.5 text-[11px] font-semibold text-champagne-700">
              {data.mode === "google-sheets"
                ? "Google Sheets Live"
                : "Local Demo Mode"}
            </span>
          </div>
          <p className="mt-1 text-sm text-espresso-500">
            Track who opened their invite, who hasn&apos;t responded yet, and
            exact headcounts across both families.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => void fetchDashboard(unlockedCode)}
            className="inline-flex items-center gap-1.5 rounded-full border border-champagne-300 bg-ivory-50 px-4 py-2 text-xs font-semibold text-espresso-700 hover:bg-champagne-300/25"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-champagne-600 to-champagne-500 px-5 py-2 text-xs font-semibold text-ivory-50 shadow-sm hover:brightness-105"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Guest
          </button>
        </div>
      </div>

      {/* Add Guest Panel */}
      {showAddForm ? (
        <form
          onSubmit={handleAddGuest}
          className="card-silk-surface mt-6 rounded-2xl border border-champagne-300/75 p-5 sm:p-6"
        >
          <h2 className="font-serif text-xl font-semibold text-espresso-900">
            Add Pre-Configured Guest / Household
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-espresso-700">
                Display Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!newSlug || newSlug === slugifyName(newName)) {
                    setNewSlug(slugifyName(e.target.value));
                  }
                }}
                placeholder="e.g. Tariq Uncle & Family"
                className="w-full rounded-xl border border-champagne-300 bg-ivory-50 px-3 py-2 text-sm focus:border-champagne-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-espresso-700">
                URL Slug
              </label>
              <input
                type="text"
                required
                value={newSlug}
                onChange={(e) => setNewSlug(slugifyName(e.target.value))}
                placeholder="tariq-uncle"
                className="w-full rounded-xl border border-champagne-300 bg-ivory-50 px-3 py-2 text-sm focus:border-champagne-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-espresso-700">
                Family Side
              </label>
              <select
                value={newSide}
                onChange={(e) => setNewSide(e.target.value as GuestSide)}
                className="w-full rounded-xl border border-champagne-300 bg-ivory-50 px-3 py-2 text-sm focus:border-champagne-500 focus:outline-none"
              >
                <option value="groom">Groom&apos;s Side</option>
                <option value="bride">Bride&apos;s Side</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-espresso-700">
                Max Reserved Seats
              </label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={newMaxSeats}
                onChange={(e) => setNewMaxSeats(Number(e.target.value) || 1)}
                className="w-full rounded-xl border border-champagne-300 bg-ivory-50 px-3 py-2 text-sm focus:border-champagne-500 focus:outline-none"
              />
            </div>
          </div>

          {addError ? (
            <p className="mt-3 text-xs font-medium text-rose-700">{addError}</p>
          ) : null}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-full px-4 py-2 text-xs font-medium text-espresso-500 hover:bg-ivory-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingGuest}
              className="rounded-full bg-champagne-600 px-5 py-2 text-xs font-semibold text-ivory-50 hover:bg-champagne-700 disabled:opacity-60"
            >
              {savingGuest ? "Saving..." : "Save Guest"}
            </button>
          </div>
        </form>
      ) : null}

      {/* Summary KPIs */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="card-silk-surface rounded-2xl border border-champagne-300/70 p-4">
          <div className="flex items-center justify-between text-champagne-700">
            <span className="text-[11px] font-semibold tracking-wider uppercase">
              Confirmed Guests
            </span>
            <Users className="h-4 w-4" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso-900">
            {summary.totalAttendingGuests}
            <span className="text-base font-normal text-espresso-500">
              {" "}
              / {summary.totalReservedSeats} seats
            </span>
          </p>
          <p className="mt-1 text-[11px] text-espresso-500">
            Groom: {summary.groomSideAttendingGuests} · Bride:{" "}
            {summary.brideSideAttendingGuests}
          </p>
        </div>

        <div className="card-silk-surface rounded-2xl border border-emerald-200 p-4">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-semibold tracking-wider uppercase">
              Attending
            </span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso-900">
            {summary.attendingHouseholds}
          </p>
          <p className="mt-1 text-[11px] text-espresso-500">
            Confirmed households
          </p>
        </div>

        <div className="card-silk-surface rounded-2xl border border-amber-200 p-4">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-semibold tracking-wider uppercase">
              Opened · No Reply
            </span>
            <Eye className="h-4 w-4" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso-900">
            {summary.openedNoResponseCount}
          </p>
          <p className="mt-1 text-[11px] text-espresso-500">
            Viewed card, pending RSVP
          </p>
        </div>

        <div className="card-silk-surface rounded-2xl border border-stone-200 p-4">
          <div className="flex items-center justify-between text-stone-600">
            <span className="text-[11px] font-semibold tracking-wider uppercase">
              Not Opened
            </span>
            <MailWarning className="h-4 w-4" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso-900">
            {summary.notOpenedCount}
          </p>
          <p className="mt-1 text-[11px] text-espresso-500">
            Link not visited yet
          </p>
        </div>

        <div className="card-silk-surface rounded-2xl border border-rose-200 p-4">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-semibold tracking-wider uppercase">
              Declined
            </span>
            <XCircle className="h-4 w-4" />
          </div>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso-900">
            {summary.declinedHouseholds}
          </p>
          <p className="mt-1 text-[11px] text-espresso-500">
            Out of {summary.totalHouseholds} invited
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {(
            ["ALL", "Not Opened", "Opened", "Attending", "Declined"] as const
          ).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                statusFilter === status
                  ? "border-champagne-500 bg-champagne-500 text-ivory-50"
                  : "border-champagne-300/80 bg-ivory-50 text-espresso-700 hover:bg-ivory-200"
              }`}
            >
              {status === "ALL" ? "All Statuses" : status}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sideFilter}
            onChange={(e) => setSideFilter(e.target.value as GuestSide | "ALL")}
            className="rounded-full border border-champagne-300 bg-ivory-50 px-3.5 py-1.5 text-xs font-semibold text-espresso-700 focus:outline-none"
          >
            <option value="ALL">Both Sides</option>
            <option value="groom">Groom&apos;s Side ({summary.groomSideHouseholds})</option>
            <option value="bride">Bride&apos;s Side ({summary.brideSideHouseholds})</option>
          </select>

          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-espresso-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest..."
              className="rounded-full border border-champagne-300 bg-ivory-50 py-1.5 pr-4 pl-8 text-xs text-espresso-900 focus:border-champagne-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Guest Table */}
      <div className="card-silk-surface mt-4 overflow-hidden rounded-3xl border border-champagne-300/75">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-champagne-300/60 bg-ivory-100/80 text-[11px] font-semibold tracking-wider text-espresso-500 uppercase">
              <tr>
                <th className="px-5 py-3.5">Guest / Household</th>
                <th className="px-4 py-3.5">Side</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Headcount</th>
                <th className="px-4 py-3.5">Open Tracking</th>
                <th className="px-5 py-3.5 text-right">Share Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-champagne-300/45">
              {filteredGuests.map((g) => {
                const inviteUrl = getInviteUrl(g.slug);
                const whatsappMsg = `Assalamu Alaikum ${g.displayName}, you are warmly invited to our family's Nikah & Joint Wedding Reception! Please tap your personal invitation link to view details and confirm your seats:\n${inviteUrl}`;

                return (
                  <tr key={g.slug} className="hover:bg-ivory-100/50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-espresso-900">
                        {g.displayName}
                      </div>
                      <div className="text-xs text-espresso-500">
                        /invite/{g.slug}
                      </div>
                      {g.message ? (
                        <div className="mt-1 flex items-start gap-1 text-xs italic text-champagne-700">
                          <MessageSquare className="mt-0.5 h-3 w-3 shrink-0" />
                          <span className="line-clamp-2">{g.message}</span>
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full border border-champagne-300/70 bg-ivory-50 px-2.5 py-0.5 text-xs font-medium text-espresso-700">
                        {g.side === "bride" ? "Bride's Side" : "Groom's Side"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[g.status]}`}
                      >
                        {g.status === "Opened" ? "Opened (No Reply)" : g.status}
                      </span>
                    </td>

                    <td className="px-4 py-4 tabular-nums">
                      {g.status === "Attending" ? (
                        <span className="font-semibold text-emerald-800">
                          {g.attendingCount}{" "}
                          <span className="font-normal text-espresso-500">
                            / {g.maxSeats} max
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-espresso-500">
                          0 / {g.maxSeats} reserved
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs text-espresso-500">
                      {g.openedAt ? (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-champagne-600" />
                          <span>
                            {g.openCount}x ·{" "}
                            {new Date(g.openedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-stone-400">Not opened yet</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => void copyText(`url-${g.slug}`, inviteUrl)}
                          className="inline-flex items-center gap-1 rounded-full border border-champagne-300 bg-ivory-50 px-3 py-1.5 text-xs font-medium text-espresso-700 hover:bg-champagne-300/30"
                        >
                          {copiedKey === `url-${g.slug}` ? (
                            <Check className="h-3 w-3 text-emerald-700" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          URL
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            void copyText(`wa-${g.slug}`, whatsappMsg)
                          }
                          className="inline-flex items-center gap-1 rounded-full border border-champagne-300 bg-ivory-50 px-3 py-1.5 text-xs font-medium text-espresso-700 hover:bg-champagne-300/30"
                        >
                          {copiedKey === `wa-${g.slug}` ? (
                            <Check className="h-3 w-3 text-emerald-700" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          WhatsApp
                        </button>

                        <Link
                          href={`/invite/${g.slug}`}
                          target="_blank"
                          className="inline-flex items-center justify-center rounded-full border border-champagne-300 bg-ivory-50 p-1.5 text-champagne-700 hover:bg-champagne-300/30"
                          title="Open guest card"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredGuests.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-espresso-500"
                  >
                    No guests match the current filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
