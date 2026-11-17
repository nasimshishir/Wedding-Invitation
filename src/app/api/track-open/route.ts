import { NextResponse } from "next/server";
import { trackGuestOpen } from "@/lib/guest-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { slug?: string };
    const slug = body.slug?.trim();
    if (!slug) {
      return NextResponse.json(
        { ok: false, error: "Missing guest slug" },
        { status: 400 }
      );
    }

    const guest = await trackGuestOpen(slug);
    if (!guest) {
      return NextResponse.json(
        { ok: false, error: "Guest not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, guest });
  } catch (error) {
    console.error("Failed to track open:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to track invitation open" },
      { status: 500 }
    );
  }
}
