"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function StripKarya({ judul, deskripsi, children }) {
    const jalur = useRef(null);

    function geser(arah) {
        if (jalur.current) jalur.current.scrollBy({ left: arah * 280, behavior: "smooth" });
    }

    const tombol =
        "inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-colors duration-state-change";

    return (
        <>
        <div className="flex items-end justify-between gap-4 mb-6">
            <div className="flex flex-col gap-1">
            <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface">{judul}</h2>
            <p className="font-body text-body-sm text-outline">{deskripsi}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => geser(-1)} aria-label="Geser ke kiri" className={tombol}>
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => geser(1)} aria-label="Geser ke kanan" className={tombol}>
                <ChevronRight className="w-5 h-5" />
            </button>
            </div>
        </div>
        <div
            ref={jalur}
            className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth py-2 snap-x"
            tabIndex={0}
            aria-label="Daftar geser ke samping"
        >
            {children}
        </div>
        </>
    );
}
