"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { kelasInput } from "@/lib/gaya";

export default function FormTautan({ awal = [], maks = 10 }) {
    const [baris, setBaris] = useState(() => awal.map((t, i) => ({ id: i, judul: t.judul, url: t.url })));
    const [nomor, setNomor] = useState(awal.length);

    function tambah() {
        setBaris([...baris, { id: nomor, judul: "", url: "" }]);
        setNomor(nomor + 1);
    }
    function ubah(id, kolom, nilai) {
        setBaris(baris.map((b) => (b.id === id ? { ...b, [kolom]: nilai } : b)));
    }

    return (
        <div className="space-y-3">
        {baris.length === 0 && <p className="text-body-sm text-light-on-surface-variant">Belum ada tautan. Klik tombol di bawah untuk menambahkan.</p>}
        {baris.map((b, i) => (
            <div key={b.id} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-center">
            <input
                type="text"
                name="tautan_judul"
                value={b.judul}
                onChange={(e) => ubah(b.id, "judul", e.target.value)}
                maxLength={30}
                placeholder="Judul tautan (mis. Instagram)"
                aria-label={"Judul tautan " + (i + 1)}
                className={kelasInput}
            />
            <input
                type="url"
                name="tautan_url"
                value={b.url}
                onChange={(e) => ubah(b.id, "url", e.target.value)}
                maxLength={300}
                placeholder="https://..."
                aria-label={"Alamat tautan " + (i + 1)}
                className={kelasInput}
            />
            <button
                type="button"
                onClick={() => setBaris(baris.filter((x) => x.id !== b.id))}
                aria-label={"Hapus tautan " + (i + 1)}
                className="p-2.5 rounded text-danger hover:bg-rose-50 transition-colors justify-self-start"
            >
                <Trash2 className="w-4 h-4" />
            </button>
            </div>
        ))}
        {baris.length < maks && (
            <button
            type="button"
            onClick={tambah}
            className="px-4 py-2 rounded-DEFAULT border border-light-outline text-body-sm font-medium text-light-on-surface hover:bg-warm-cream transition-colors flex items-center gap-2"
            >
            <Plus className="w-4 h-4" />
            <span>Tambah Tautan</span>
            </button>
        )}
        </div>
    );
}
