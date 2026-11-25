"use client";

import { useState } from "react";

export default function PilihKategoriChallenge({ kategori = [], kategoriTerpilih = [], bebasAwal = false }) {
    const [bebas, setBebas] = useState(bebasAwal);
    const [terpilih, setTerpilih] = useState(bebasAwal ? [] : kategoriTerpilih);

    function ubahBebas(checked) {
        setBebas(checked);
        if (checked) setTerpilih([]);
    }

    function ubahKategori(id, checked) {
        if (checked) {
            setBebas(false);
            setTerpilih((prev) => (prev.includes(id) ? prev : [...prev, id]));
        } else {
            setTerpilih((prev) => prev.filter((item) => item !== id));
        }
    }

    return (
        <div className="space-y-3">
            <label
                className={
                    "flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors " +
                    (bebas
                        ? "border-light-primary bg-light-primary-container/20"
                        : "border-light-outline hover:bg-warm-cream")
                }
            >
                <input
                    type="checkbox"
                    name="semua_kategori"
                    value="1"
                    checked={bebas}
                    onChange={(e) => ubahBebas(e.target.checked)}
                    className="mt-0.5 rounded border-light-outline text-light-primary focus:ring-light-primary shrink-0"
                />
                <div className="min-w-0">
                    <span className="text-body-sm font-semibold text-light-on-surface block">
                        Bebas (Semua Kategori)
                    </span>
                    <span className="text-xs text-light-on-surface-variant block leading-relaxed">
                        Semua kategori karya diizinkan untuk mengikuti challenge ini.
                    </span>
                </div>
            </label>

            {kategori.length === 0 ? (
                <p className="text-body-sm text-light-on-surface-variant">
                    Belum ada kategori khusus. Anda tetap dapat menggunakan pilihan Bebas (Semua Kategori).
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                    {kategori.map((k) => {
                        const aktif = !bebas && terpilih.includes(k.id);
                        return (
                            <label
                                key={k.id}
                                className={
                                    "flex items-center gap-2.5 p-2.5 rounded border cursor-pointer transition-colors min-w-0 " +
                                    (aktif
                                        ? "border-light-primary bg-light-primary-container/20"
                                        : bebas
                                        ? "border-light-outline-variant bg-warm-cream/40 text-light-on-surface-variant hover:bg-warm-cream"
                                        : "border-light-outline hover:bg-warm-cream")
                                }
                            >
                                <input
                                    type="checkbox"
                                    name="kategori"
                                    value={k.id}
                                    checked={aktif}
                                    onChange={(e) => ubahKategori(k.id, e.target.checked)}
                                    className="rounded border-light-outline text-light-primary focus:ring-light-primary shrink-0"
                                />
                                <span className="text-body-sm font-medium break-words leading-snug">{k.name}</span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
