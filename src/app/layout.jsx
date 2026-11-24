import { Suspense } from "react";
import "./globals.css";
import LacakRiwayat from "@/components/layout/LacakRiwayat";
import PenangkapValidasi from "@/components/layout/PenangkapValidasi";

export const metadata = {
  title: {
    default: "creosphere — Pameran Seni Digital Global",
    template: "%s — creosphere",
  },
  description:
    "Ruang global bagi seniman untuk berbagi, memamerkan, dan mengapresiasi kreativitas.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-surface text-on-surface font-body antialiased selection:bg-primary-container selection:text-on-primary-container">
        <Suspense fallback={null}>
          <LacakRiwayat />
        </Suspense>
        <PenangkapValidasi />
        {children}
      </body>
    </html>
  );
}
