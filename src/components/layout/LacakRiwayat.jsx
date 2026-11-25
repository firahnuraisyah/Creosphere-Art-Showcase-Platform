"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export const KUNCI_RIWAYAT = "creosphere_riwayat";
export const ACARA_RIWAYAT = "creosphere-riwayat";

export function bacaRiwayat() {
    try {
        const data = JSON.parse(sessionStorage.getItem(KUNCI_RIWAYAT) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export default function LacakRiwayat() {
    const pathname = usePathname();
    const query = useSearchParams().toString();

    useEffect(() => {
        const url = pathname + (query ? "?" + query : "");
        const riwayat = bacaRiwayat();
        const n = riwayat.length;
        if (riwayat[n - 1] === url) return;
        if (n >= 2 && riwayat[n - 2] === url) riwayat.pop();
        else riwayat.push(url);
        try {
            sessionStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(riwayat.slice(-30)));
        } catch {}
        window.dispatchEvent(new Event(ACARA_RIWAYAT));
    }, [pathname, query]);

    return null;
}
