    "use client";

    import { useState } from "react";
    import Link from "next/link";
    import { Check } from "lucide-react";
    import TombolKirim from "@/components/ui/TombolKirim";
    import { kelasInput, kelasLabel } from "@/lib/gaya";

    export default function FormKarya({ kategori, nilai = {}, selaluTampilJenis = false }) {
    const [kategoriDipilih, setKategoriDipilih] = useState(String(nilai.category_id || ""));
    const dipilih = kategori.find((k) => String(k.id) === kategoriDipilih);
    const wajibJenis = Boolean(dipilih && dipilih.is_system);

    return (
        <>
        <div>
            <label htmlFor="title" className={kelasLabel}>
            Judul Karya <span className="text-danger">*</span>
            </label>
            <input
            type="text"
            id="title"
            name="title"
            required
            maxLength={100}
            defaultValue={nilai.title || ""}
            placeholder="mis. Bisikan Sang Bumi"
            className={kelasInput}
            />
        </div>

        <div>
            <label htmlFor="description" className={kelasLabel}>
            Deskripsi Karya <span className="text-danger">*</span>
            </label>
            <textarea
            id="description"
            name="description"
            rows={4}
            required
            defaultValue={nilai.description || ""}
            placeholder="Ceritakan medium, inspirasi, gagasan, atau proses di balik karya ini..."
            className="w-full p-3.5 rounded-DEFAULT bg-light-surface border border-light-outline text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary text-body-md"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label htmlFor="category_id" className={kelasLabel}>
                Kategori <span className="text-danger">*</span>
            </label>
            <select
                id="category_id"
                name="category_id"
                required
                value={kategoriDipilih}
                onChange={(e) => setKategoriDipilih(e.target.value)}
                className={kelasInput}
            >
                <option value="" disabled>
                Pilih kategori
                </option>
                {kategori.map((k) => (
                <option key={k.id} value={k.id}>
                    {k.is_system ? k.name + " (Wajib Mengisi Jenis Karya)" : k.name}
                </option>
                ))}
            </select>
            </div>

            {(wajibJenis || selaluTampilJenis) && (
            <div>
                <label htmlFor="artwork_type" className={kelasLabel}>
                {selaluTampilJenis ? "Jenis Karya (Teknik Spesifik)" : "Sebutkan Jenis Karya"}{" "}
                {wajibJenis && <span className="text-danger">* (Wajib untuk Lainnya)</span>}
                </label>
                <input
                type="text"
                id="artwork_type"
                name="artwork_type"
                maxLength={60}
                defaultValue={nilai.artwork_type || ""}
                placeholder="mis. Seni Kertas Eksperimental, Cetakan Resin"
                className={
                    wajibJenis && !selaluTampilJenis
                    ? "w-full px-3.5 py-2.5 rounded-DEFAULT bg-warm-cream border border-terracotta text-light-on-surface focus:ring-1 focus:ring-terracotta text-body-md"
                    : kelasInput
                }
                />
                <span className="text-xs text-terracotta mt-1 block">Maksimal 60 karakter.</span>
            </div>
            )}
        </div>

        <div>
            <label htmlFor="tags" className={kelasLabel}>
            Tag Karya <span className="text-danger">* (Minimal 1)</span>
            </label>
            <input
            type="text"
            id="tags"
            name="tags"
            required
            defaultValue={nilai.tags || ""}
            placeholder="mis. lanskap, alam, warna bumi (pisahkan dengan koma)"
            className={kelasInput}
            />
            <p className="text-xs text-light-on-surface-variant mt-1.5">
            Tag membantu penikmat seni menemukan karya Anda. Minimal 1 tag, maksimal 10; tag ganda otomatis dibersihkan.
            </p>
        </div>
        </>
    );
    }

    export function TombolFormKarya({ teks, teksMemuat, kembali = "/member/artworks" }) {
    return (
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-light-outline-variant">
        <Link
            href={kembali}
            className="px-5 py-2.5 rounded-DEFAULT border border-light-outline text-light-on-surface font-medium hover:bg-warm-cream transition-colors text-body-sm"
        >
            Batal
        </Link>
        <TombolKirim
            teksMemuat={teksMemuat}
            className="px-6 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-primary-hover transition-colors shadow-sm text-body-sm flex items-center gap-2"
        >
            <Check className="w-4 h-4" />
            <span>{teks}</span>
        </TombolKirim>
        </div>
    );
    }
