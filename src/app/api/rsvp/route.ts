import { NextResponse } from "next/server";
import { submitGuestRsvp } from "@/lib/guest-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      slug?: string;
      attending?: boolean;
      attendingCount?: number;
      message?: string;
      phone?: string;
    };

    const slug = body.slug?.trim();
    if (!slug || typeof body.attending !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "Missing required RSVP fields" },
        { status: 400 }
      );
    }

    const attendingCount = body.attending
      ? Math.max(1, Number(body.attendingCount ?? 1) || 1)
      : 0;

    const guest = await submitGuestRsvp({
      slug,
      attending: body.attending,
      attendingCount,
      message: body.message ?? "",
      phone: body.phone ?? "",
    });

    if (!guest) {
      return NextResponse.json(
        { ok: false, error: "Guest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, guest });
  } catch (error) {
    console.error("Failed to submit RSVP:", error);
    return NextResponse.json(
      { ok: false, error: "Could not save RSVP response" },
      { status: 500 }
    );
  }
}
