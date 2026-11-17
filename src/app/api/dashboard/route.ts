import { NextResponse } from "next/server";
import {
  computeDashboardSummary,
  createOrUpdateGuest,
  isGoogleSheetsConnected,
  listGuests,
} from "@/lib/guest-store";
import type { GuestSide } from "@/types/guest";

type PortalRole = "groom" | "bride" | "all";

function resolvePortalRole(request: Request): PortalRole | null {
  const provided = (request.headers.get("x-host-passcode") ?? "").trim();
  if (!provided) return null;

  const groomPass = (process.env.GROOM_PASSCODE ?? "groom2026").trim();
  const bridePass = (process.env.BRIDE_PASSCODE ?? "bride2026").trim();
  const hostPass = (process.env.HOST_PASSCODE ?? "nikah2026").trim();

  if (groomPass && provided === groomPass) return "groom";
  if (bridePass && provided === bridePass) return "bride";
  if (hostPass && provided === hostPass) return "all";
  return null;
}

export async function GET(request: Request) {
  const role = resolvePortalRole(request);
  if (!role) {
    return NextResponse.json(
      { ok: false, error: "Invalid passcode" },
      { status: 401 }
    );
  }

  try {
    const sideFilter: GuestSide | undefined =
      role === "all" ? undefined : role;
    const guests = await listGuests(sideFilter);
    const summary = computeDashboardSummary(guests);
    return NextResponse.json({
      ok: true,
      role,
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
  const role = resolvePortalRole(request);
  if (!role) {
    return NextResponse.json(
      { ok: false, error: "Invalid passcode" },
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

    // Lock the side & addedBy tag to the logged-in passcode so Groom/Bride families
    // always write to their own spreadsheet and identify whose guest it is.
    const side: GuestSide =
      role === "groom"
        ? "groom"
        : role === "bride"
        ? "bride"
        : body.side === "bride"
        ? "bride"
        : "groom";

    const addedBy =
      role === "groom"
        ? "Groom's Side"
        : role === "bride"
        ? "Bride's Side"
        : `Host (${side === "bride" ? "Bride" : "Groom"}'s Side)`;

    const guest = await createOrUpdateGuest({
      slug: body.slug,
      displayName: body.displayName,
      side,
      maxSeats: Number(body.maxSeats ?? 1) || 1,
      addedBy,
    });

    return NextResponse.json({ ok: true, guest });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save guest";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
