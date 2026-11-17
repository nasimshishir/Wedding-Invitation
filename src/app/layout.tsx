import type { Metadata } from "next";
import { WEDDING_CONFIG } from "@/config/wedding";
import "./globals.css";

export const metadata: Metadata = {
  title: `${WEDDING_CONFIG.couple.groomFirstName} & ${WEDDING_CONFIG.couple.brideFirstName} — Wedding Invitation`,
  description: `Join us for the Nikah & Mutual Wedding Reception on ${WEDDING_CONFIG.event.dateDisplay} at ${WEDDING_CONFIG.event.venueName}.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Great+Vibes&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="ivory-paper-bg min-h-screen antialiased selection:bg-champagne-300/40 selection:text-espresso-900">
        {children}
      </body>
    </html>
  );
}
