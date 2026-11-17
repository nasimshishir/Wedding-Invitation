import type { Metadata } from "next";
import Link from "next/link";
import { InvitationCard } from "@/components/InvitationCard";
import { FloralCorner, BotanicalDivider } from "@/components/FloralArt";
import { WEDDING_CONFIG } from "@/config/wedding";
import { getGuestBySlug } from "@/lib/guest-store";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guest = await getGuestBySlug(slug);

  if (!guest) {
    return {
      title: `${WEDDING_CONFIG.couple.groomFirstName} & ${WEDDING_CONFIG.couple.brideFirstName} — Wedding Invitation`,
    };
  }

  const pairTitle =
    guest.side === "bride"
      ? `${WEDDING_CONFIG.couple.brideFirstName} & ${WEDDING_CONFIG.couple.groomFirstName}`
      : `${WEDDING_CONFIG.couple.groomFirstName} & ${WEDDING_CONFIG.couple.brideFirstName}`;

  return {
    title: `Invitation for ${guest.displayName} — ${pairTitle}'s Wedding`,
    description: `Assalamu Alaikum ${guest.displayName}! You are cordially invited to the Nikah & Mutual Wedding Reception of ${pairTitle} on ${WEDDING_CONFIG.event.dateDisplay}.`,
    openGraph: {
      title: `Invitation for ${guest.displayName} — ${pairTitle}`,
      description: `Join us for the Nikah & Mutual Reception on ${WEDDING_CONFIG.event.dateDisplay} at ${WEDDING_CONFIG.event.venueName}.`,
    },
  };
}

export default async function PersonalizedInvitePage({ params }: PageProps) {
  const { slug } = await params;
  const guest = await getGuestBySlug(slug);

  if (!guest) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="card-silk-surface relative max-w-md overflow-hidden rounded-3xl border border-champagne-300/75 px-8 py-12 text-center">
          <FloralCorner position="top-left" className="absolute top-0 left-0 h-28 w-28 opacity-80" />
          <FloralCorner position="bottom-right" className="absolute right-0 bottom-0 h-28 w-28 opacity-80" />
          <div className="relative z-10">
            <p className="text-[11px] font-semibold tracking-[0.26em] text-champagne-600 uppercase">
              Invitation Not Found
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-espresso-900">
              We Couldn&apos;t Find That Link
            </h1>
            <BotanicalDivider className="my-5" />
            <p className="text-sm leading-relaxed text-espresso-500">
              Please double-check the personal link shared with you, or reach out
              to either family coordinator so we can resend your invitation.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full border border-champagne-400 px-6 py-2.5 text-xs font-semibold tracking-[0.18em] text-champagne-700 uppercase transition hover:bg-champagne-300/25"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <InvitationCard initialGuest={guest} />;
}
