"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { ArrowLeft } from "lucide-react";
import { ACARA_RIWAYAT, bacaRiwayat } from "@/components/layout/LacakRiwayat";

function namaHalaman(url) {
    const path = url.split("?")[0];
    if (path === "/") return "Beranda";
    if (path === "/artworks") return "Jelajahi";
    if (path === "/artists") return "Komunitas";
    if (/^\/artists\/\d+$/.test(path)) return "Profil Seniman";
    if (/^\/curators\/\d+$/.test(path)) return "Profil Curator";
    if (path === "/challenges") return "Challenge";
    if (/^\/challenges\/\d+$/.test(path)) return "Halaman Challenge";
    if (/^\/challenges\/\d+\/submit$/.test(path)) return "Submisi Challenge";
    if (/^\/artworks\/\d+$/.test(path)) return "Halaman Karya";
    if (path === "/search") return "Hasil Pencarian";
    if (path === "/member/favorites") return "Favorit";
    if (path === "/member/artworks") return "Edit Karya";
    if (path === "/member/artworks/new") return "Unggah Karya";
    if (/^\/member\/artworks\/\d+\/edit$/.test(path)) return "Edit Karya";
    if (path === "/member/profile") return "Edit Profil";
    if (path === "/member/submissions") return "Submisi";
    if (path === "/curator/challenges") return "Challenge Saya";
    if (path === "/curator/challenges/new") return "Buat Challenge";
    if (/^\/curator\/challenges\/\d+\/edit$/.test(path)) return "Edit Challenge";
    if (/^\/curator\/challenges\/\d+\/submissions$/.test(path)) return "Submisi Challenge";
    if (/^\/curator\/challenges\/\d+\/winners$/.test(path)) return "Pemenang Challenge";
    if (path === "/curator/profile") return "Edit Profil";
    return "Halaman Sebelumnya";
}

function langgananRiwayat(callback) {
    window.addEventListener(ACARA_RIWAYAT, callback);
    return () => window.removeEventListener(ACARA_RIWAYAT, callback);
}

function halamanAsal() {
    const sekarang = window.location.pathname + window.location.search;
    const riwayat = bacaRiwayat();
    const asal = riwayat[riwayat.length - 1] === sekarang ? riwayat[riwayat.length - 2] : riwayat[riwayat.length - 1];
    return asal && asal !== sekarang ? asal : "";
}

export default function TombolKembali({ bawaan }) {
    usePathname();
    const asal = useSyncExternalStore(langgananRiwayat, halamanAsal, () => "");
    const tujuan = asal ? { href: asal, label: namaHalaman(asal) } : bawaan;

    return (
        <Link
        href={tujuan.href}
        className="inline-flex items-center gap-1.5 font-label text-label-lg text-on-surface-variant hover:text-on-surface hover:underline underline-offset-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Kembali ke {tujuan.label}</span>
        </Link>
    );
}
