import { NextResponse } from "next/server";
import {
  computeDashboardSummary,
  createOrUpdateGuest,
  isGoogleSheetsConnected,
  listGuests,
} from "@/lib/guest-store";
import type { GuestSide } from "@/types/guest";

function isAuthorized(request: Request): boolean {
  const expected = (process.env.HOST_PASSCODE ?? "nikah2026").trim();
  const provided = (request.headers.get("x-host-passcode") ?? "").trim();
  return expected.length > 0 && provided === expected;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: "Invalid host passcode" },
      { status: 401 }
    );
  }

  try {
    const guests = await listGuests();
    const summary = computeDashboardSummary(guests);
    return NextResponse.json({
      ok: true,
      mode: isGoogleSheetsConnected() ? "google-sheets" : "local-demo",
      guests,
      summary,
    });
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load guest list" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: "Invalid host passcode" },
      { status: 401 }
    );
  }

  try {
    const body = (await request.json()) as {
      slug?: string;
      displayName?: string;
      side?: GuestSide;
      maxSeats?: number;
    };

    if (!body.slug || !body.displayName) {
      return NextResponse.json(
        { ok: false, error: "Slug and display name are required" },
        { status: 400 }
      );
    }

    const side: GuestSide = body.side === "bride" ? "bride" : "groom";
    const guest = await createOrUpdateGuest({
      slug: body.slug,
      displayName: body.displayName,
      side,
      maxSeats: Number(body.maxSeats ?? 1) || 1,
    });

    return NextResponse.json({ ok: true, guest });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save guest";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
