"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import GambarKarya from "@/components/ui/GambarKarya";

const LEBAR = [
    { min: 1024, kolom: 5 },
    { min: 768, kolom: 4 },
    { min: 540, kolom: 3 },
    { min: 0, kolom: 2 },
];

function hitungKolom() {
    for (const l of LEBAR) if (window.innerWidth >= l.min) return l.kolom;
    return 2;
}
function langgan(cb) {
    window.addEventListener("resize", cb);
    return () => window.removeEventListener("resize", cb);
}

export default function Masonry({ karya, kolom: tetap }) {
    const otomatis = useSyncExternalStore(langgan, hitungKolom, () => 5);
    const jumlah = tetap || otomatis;

    const kolom = Array.from({ length: jumlah }, () => ({ tinggi: 0, isi: [] }));
    for (const k of karya) {
        const tinggiRelatif = 1 / (k.rasio || 0.8);
        let sasaran = kolom[0];
        for (const c of kolom) if (c.tinggi < sasaran.tinggi - 0.0001) sasaran = c;
        sasaran.isi.push(k);
        sasaran.tinggi += tinggiRelatif;
    }

    return (
        <div className="flex gap-3 items-start" data-masonry>
        {kolom.map((c, i) => (
            <div key={i} className="flex-1 min-w-0 flex flex-col gap-3">
            {c.isi.map((k) => (
                <Link
                key={k.id}
                href={"/artworks/" + k.id}
                aria-label={k.artis ? k.title + " oleh " + k.artis : k.title}
                className="relative block overflow-hidden rounded-lg bg-surface-container transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                <GambarKarya
                    src={k.file_url}
                    alt={k.artis ? k.title + " oleh " + k.artis : k.title}
                    className="block w-full h-auto"
                    style={{ aspectRatio: String(k.rasio || 0.8) }}
                />
                {k.is_active === false && (
                    <span className="absolute left-2 top-2 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-label-sm font-medium">
                    Akun nonaktif
                    </span>
                )}
                </Link>
            ))}
            </div>
        ))}
        </div>
    );
}
