import Link from "next/link";
import { ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";
import {
  BotanicalDivider,
  FloralCorner,
  WaxSealMonogram,
} from "@/components/FloralArt";
import { WEDDING_CONFIG } from "@/config/wedding";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="card-silk-surface relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-champagne-300/75 px-6 py-12 text-center sm:px-12">
        <FloralCorner position="top-left" className="absolute top-0 left-0 h-32 w-32 opacity-85" />
        <FloralCorner position="top-right" className="absolute top-0 right-0 h-32 w-32 opacity-85" />
        <FloralCorner position="bottom-left" className="absolute bottom-0 left-0 h-28 w-28 opacity-75" />
        <FloralCorner position="bottom-right" className="absolute right-0 bottom-0 h-28 w-28 opacity-75" />

        <div className="relative z-10 flex flex-col items-center">
          <p className="font-serif text-lg text-champagne-700">
            {WEDDING_CONFIG.couple.arabicGreeting}
          </p>

          <div className="mt-5">
            <WaxSealMonogram monogram={WEDDING_CONFIG.couple.monogram} />
          </div>

          <h1 className="champagne-foil-text mt-6 font-script text-5xl sm:text-6xl">
            {WEDDING_CONFIG.couple.groomFirstName} &amp;{" "}
            {WEDDING_CONFIG.couple.brideFirstName}
          </h1>
          <p className="mt-2 font-serif text-lg text-espresso-700">
            {WEDDING_CONFIG.event.title}
          </p>
          <p className="mt-1 text-xs tracking-[0.22em] text-champagne-700 uppercase">
            {WEDDING_CONFIG.event.dateDisplay} · {WEDDING_CONFIG.event.venueName}
          </p>

          <BotanicalDivider className="my-6 w-full" />

          <p className="max-w-md text-sm leading-relaxed text-espresso-500">
            This wedding uses personalized invitation links for each household.
            Please open the custom link sent to you via WhatsApp or message.
          </p>

          {/* Demo & Host Quick Links */}
          <div className="mt-8 w-full rounded-2xl border border-champagne-300/70 bg-ivory-50/85 p-5 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-champagne-700 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Preview &amp; Host Tools
            </div>
            <p className="mt-1.5 text-xs text-espresso-500">
              Test how the invitation adapts for each side, or open the Host
              Dashboard to track Opened / Not Responded / Attending statuses.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              <Link
                href="/invite/karim-uncle"
                className="flex items-center justify-between rounded-xl border border-champagne-300 bg-ivory-100/80 px-4 py-3 text-xs font-semibold text-espresso-900 transition hover:bg-champagne-300/30"
              >
                <span>Groom&apos;s Side Sample</span>
                <ArrowRight className="h-3.5 w-3.5 text-champagne-600" />
              </Link>
              <Link
                href="/invite/farhana-apu"
                className="flex items-center justify-between rounded-xl border border-champagne-300 bg-ivory-100/80 px-4 py-3 text-xs font-semibold text-espresso-900 transition hover:bg-champagne-300/30"
              >
                <span>Bride&apos;s Side Sample</span>
                <ArrowRight className="h-3.5 w-3.5 text-champagne-600" />
              </Link>
            </div>

            <Link
              href="/dashboard"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-champagne-600 to-champagne-500 px-4 py-3 text-xs font-semibold tracking-wider text-ivory-50 uppercase shadow-sm transition hover:brightness-105"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Open Host Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
