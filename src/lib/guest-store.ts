import { promises as fs } from "node:fs";
import path from "node:path";
import type {
  DashboardSummary,
  GuestRecord,
  GuestSide,
  GuestStatus,
} from "@/types/guest";

const DATA_FILE = path.join(process.cwd(), "data", "guests.json");

const globalForDemo = globalThis as unknown as {
  __weddingDemoGuests?: GuestRecord[];
};

function getScriptUrl(): string | null {
  const url = process.env.GOOGLE_SCRIPT_URL?.trim();
  return url && url.length > 0 ? url : null;
}

export function isGoogleSheetsConnected(): boolean {
  return getScriptUrl() !== null;
}

async function readLocalGuests(): Promise<GuestRecord[]> {
  if (globalForDemo.__weddingDemoGuests) {
    return globalForDemo.__weddingDemoGuests;
  }
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as GuestRecord[];
    const list = Array.isArray(parsed) ? parsed : [];
    globalForDemo.__weddingDemoGuests = list;
    return list;
  } catch {
    return [];
  }
}

async function writeLocalGuests(guests: GuestRecord[]): Promise<void> {
  globalForDemo.__weddingDemoGuests = guests;
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(guests, null, 2) + "\n", "utf8");
  } catch {
    // Serverless environments (e.g. Vercel) have a read-only filesystem;
    // keep the updated state in memory until GOOGLE_SCRIPT_URL is configured.
  }
}

function normalizeGuest(raw: Partial<GuestRecord>): GuestRecord {
  const side: GuestSide = raw.side === "bride" ? "bride" : "groom";
  const maxSeats = Math.max(1, Number(raw.maxSeats ?? 1) || 1);
  const validStatuses: GuestStatus[] = [
    "Not Opened",
    "Opened",
    "Attending",
    "Declined",
  ];
  const status: GuestStatus = validStatuses.includes(raw.status as GuestStatus)
    ? (raw.status as GuestStatus)
    : "Not Opened";

  return {
    slug: String(raw.slug ?? "").trim().toLowerCase(),
    displayName: String(raw.displayName ?? "Honored Guest").trim(),
    side,
    maxSeats,
    status,
    openedAt: raw.openedAt ? String(raw.openedAt) : null,
    openCount: Math.max(0, Number(raw.openCount ?? 0) || 0),
    attendingCount: Math.max(
      0,
      Math.min(maxSeats, Number(raw.attendingCount ?? 0) || 0)
    ),
    respondedAt: raw.respondedAt ? String(raw.respondedAt) : null,
    message: raw.message ? String(raw.message) : "",
    phone: raw.phone ? String(raw.phone) : "",
  };
}

async function callAppsScriptGet<T>(
  params: Record<string, string>
): Promise<T> {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    throw new Error("GOOGLE_SCRIPT_URL is not configured");
  }
  const url = new URL(scriptUrl);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Google Script GET failed (${res.status})`);
  }
  return (await res.json()) as T;
}

async function callAppsScriptPost<T>(
  payload: Record<string, unknown>
): Promise<T> {
  const scriptUrl = getScriptUrl();
  if (!scriptUrl) {
    throw new Error("GOOGLE_SCRIPT_URL is not configured");
  }
  const res = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Google Script POST failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export async function getGuestBySlug(slug: string): Promise<GuestRecord | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  if (getScriptUrl()) {
    const data = await callAppsScriptGet<{ guest: GuestRecord | null }>({
      action: "getGuest",
      slug: normalizedSlug,
    });
    return data.guest ? normalizeGuest(data.guest) : null;
  }

  const guests = await readLocalGuests();
  const found = guests.find((g) => g.slug.toLowerCase() === normalizedSlug);
  return found ? normalizeGuest(found) : null;
}

export async function listGuests(): Promise<GuestRecord[]> {
  if (getScriptUrl()) {
    const data = await callAppsScriptGet<{ guests: GuestRecord[] }>({
      action: "listGuests",
    });
    return (data.guests ?? []).map(normalizeGuest);
  }

  const guests = await readLocalGuests();
  return guests.map(normalizeGuest);
}

export async function trackGuestOpen(
  slug: string
): Promise<GuestRecord | null> {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  if (getScriptUrl()) {
    const data = await callAppsScriptPost<{ guest: GuestRecord | null }>({
      action: "trackOpen",
      slug: normalizedSlug,
      timestamp: new Date().toISOString(),
    });
    return data.guest ? normalizeGuest(data.guest) : null;
  }

  const guests = await readLocalGuests();
  const idx = guests.findIndex((g) => g.slug.toLowerCase() === normalizedSlug);
  if (idx === -1) return null;

  const current = normalizeGuest(guests[idx]);
  const now = new Date().toISOString();
  const updated: GuestRecord = {
    ...current,
    openedAt: current.openedAt ?? now,
    openCount: current.openCount + 1,
    status: current.status === "Not Opened" ? "Opened" : current.status,
  };

  guests[idx] = updated;
  await writeLocalGuests(guests);
  return updated;
}

export async function submitGuestRsvp(input: {
  slug: string;
  attending: boolean;
  attendingCount: number;
  message?: string;
  phone?: string;
}): Promise<GuestRecord | null> {
  const normalizedSlug = input.slug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  if (getScriptUrl()) {
    const data = await callAppsScriptPost<{ guest: GuestRecord | null }>({
      action: "submitRsvp",
      slug: normalizedSlug,
      attending: input.attending,
      attendingCount: input.attendingCount,
      message: input.message ?? "",
      phone: input.phone ?? "",
      timestamp: new Date().toISOString(),
    });
    return data.guest ? normalizeGuest(data.guest) : null;
  }

  const guests = await readLocalGuests();
  const idx = guests.findIndex((g) => g.slug.toLowerCase() === normalizedSlug);
  if (idx === -1) return null;

  const current = normalizeGuest(guests[idx]);
  const now = new Date().toISOString();
  const clampedCount = input.attending
    ? Math.max(1, Math.min(current.maxSeats, Math.round(input.attendingCount)))
    : 0;

  const updated: GuestRecord = {
    ...current,
    openedAt: current.openedAt ?? now,
    status: input.attending ? "Attending" : "Declined",
    attendingCount: clampedCount,
    respondedAt: now,
    message: (input.message ?? "").trim(),
    phone: (input.phone ?? "").trim(),
  };

  guests[idx] = updated;
  await writeLocalGuests(guests);
  return updated;
}

export async function createOrUpdateGuest(input: {
  slug: string;
  displayName: string;
  side: GuestSide;
  maxSeats: number;
}): Promise<GuestRecord> {
  const normalizedSlug = input.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!normalizedSlug) {
    throw new Error("Please provide a valid URL slug (letters, numbers, hyphens).");
  }

  const maxSeats = Math.max(1, Math.min(20, Math.round(input.maxSeats || 1)));

  if (getScriptUrl()) {
    const data = await callAppsScriptPost<{ guest: GuestRecord }>({
      action: "upsertGuest",
      slug: normalizedSlug,
      displayName: input.displayName.trim(),
      side: input.side,
      maxSeats,
    });
    return normalizeGuest(data.guest);
  }

  const guests = await readLocalGuests();
  const idx = guests.findIndex((g) => g.slug.toLowerCase() === normalizedSlug);

  if (idx >= 0) {
    const existing = normalizeGuest(guests[idx]);
    const updated: GuestRecord = {
      ...existing,
      displayName: input.displayName.trim(),
      side: input.side,
      maxSeats,
      attendingCount: Math.min(existing.attendingCount, maxSeats),
    };
    guests[idx] = updated;
    await writeLocalGuests(guests);
    return updated;
  }

  const created: GuestRecord = {
    slug: normalizedSlug,
    displayName: input.displayName.trim(),
    side: input.side,
    maxSeats,
    status: "Not Opened",
    openedAt: null,
    openCount: 0,
    attendingCount: 0,
    respondedAt: null,
    message: "",
    phone: "",
  };
  guests.push(created);
  await writeLocalGuests(guests);
  return created;
}

export function computeDashboardSummary(guests: GuestRecord[]): DashboardSummary {
  return guests.reduce<DashboardSummary>(
    (acc, g) => {
      acc.totalHouseholds += 1;
      acc.totalReservedSeats += g.maxSeats;
      if (g.side === "groom") acc.groomSideHouseholds += 1;
      if (g.side === "bride") acc.brideSideHouseholds += 1;

      if (g.status === "Not Opened") acc.notOpenedCount += 1;
      if (g.status === "Opened") acc.openedNoResponseCount += 1;
      if (g.status === "Declined") acc.declinedHouseholds += 1;
      if (g.status === "Attending") {
        acc.attendingHouseholds += 1;
        acc.totalAttendingGuests += g.attendingCount;
        if (g.side === "groom") acc.groomSideAttendingGuests += g.attendingCount;
        if (g.side === "bride") acc.brideSideAttendingGuests += g.attendingCount;
      }
      return acc;
    },
    {
      totalHouseholds: 0,
      totalReservedSeats: 0,
      notOpenedCount: 0,
      openedNoResponseCount: 0,
      attendingHouseholds: 0,
      declinedHouseholds: 0,
      totalAttendingGuests: 0,
      groomSideAttendingGuests: 0,
      brideSideAttendingGuests: 0,
      groomSideHouseholds: 0,
      brideSideHouseholds: 0,
    }
  );
}
