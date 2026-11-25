import Link from "next/link";
import { Info } from "lucide-react";
import { wajibPeran } from "@/lib/auth";
import { ambilSatu } from "@/lib/query";
import { daftarNegara } from "@/lib/negara";
import { kelasInput, kelasLabel } from "@/lib/gaya";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import UnggahGambar from "@/components/ui/UnggahGambar";
import TombolKirim from "@/components/ui/TombolKirim";
import FormTautan from "@/components/ui/FormTautan";
import { bacaTautan, MAKS_TAUTAN } from "@/lib/tautan";
import { simpanProfil } from "./actions";

export const metadata = { title: "Edit Profil" };
export const dynamic = "force-dynamic";

export default async function HalamanEditProfil({ searchParams }) {
    const pengguna = await wajibPeran(["member"]);
    const { galat, sukses } = await searchParams;

    const profil = await ambilSatu(
        "SELECT display_name, bio, country, external_links, avatar_url FROM users WHERE id = $1",
        [pengguna.id]
    );
    const tautan = bacaTautan(profil?.external_links);

    return (
        <div className="max-w-4xl space-y-8">
        <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface mb-2">Edit Profil Publik</h1>
            <p className="text-body-md text-light-on-surface-variant">
            Atur bagaimana seniman dan curator lain melihat kehadiran Anda di pameran.
            </p>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        <form action={simpanProfil} className="space-y-8">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-4">
            <h2 className="font-headline text-title-lg font-bold text-light-on-surface">Foto Profil</h2>
            <UnggahGambar
                nama="avatar_url"
                jenis="avatars"
                bentuk="bulat"
                nilaiAwal={profil?.avatar_url || ""}
                bantuan="JPG, PNG, WebP hingga 2 MB. Disarankan rasio persegi 1:1."
            />
            </div>

            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-5">
            <h2 className="font-headline text-title-lg font-bold text-light-on-surface">Informasi Seniman</h2>
            <div>
                <label htmlFor="display_name" className={kelasLabel}>
                Nama Tampilan <span className="text-danger">*</span>
                </label>
                <input
                type="text"
                id="display_name"
                name="display_name"
                defaultValue={profil?.display_name || pengguna.display_name}
                required
                maxLength={50}
                className={kelasInput}
                />
            </div>

            <div>
                <label htmlFor="bio" className={kelasLabel}>
                Biografi
                </label>
                <textarea
                id="bio"
                name="bio"
                rows={4}
                maxLength={500}
                defaultValue={profil?.bio || ""}
                className="w-full p-3.5 rounded-DEFAULT bg-light-surface border border-light-outline text-light-on-surface focus:border-light-primary focus:ring-1 focus:ring-light-primary text-body-md"
                />
                <p className="text-xs text-light-on-surface-variant mt-1.5">
                Deskripsi singkat tentang filosofi berkarya dan latar belakang Anda (maksimal 500 karakter).
                </p>
            </div>

            <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <label htmlFor="country" className="block text-label-lg text-light-on-surface font-medium">
                    Negara <span className="text-xs text-light-on-surface-variant font-normal">(Opsional)</span>
                </label>
                <span className="text-xs text-olive font-medium flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Hanya tampil di profil publik Anda; tidak pernah di kartu karya atau filter pencarian.</span>
                </span>
                </div>
                <select id="country" name="country" defaultValue={profil?.country || ""} className={kelasInput}>
                <option value="">Tidak ingin menyebutkan (kosongkan)</option>
                {daftarNegara.map((negara) => (
                    <option key={negara} value={negara}>
                    {negara}
                    </option>
                ))}
                </select>
            </div>

            <div className="space-y-3 pt-2">
                <span className={kelasLabel}>
                Tautan Eksternal <span className="text-xs text-light-on-surface-variant font-normal">(Opsional, maksimal {MAKS_TAUTAN})</span>
                </span>
                <FormTautan awal={tautan} maks={MAKS_TAUTAN} />
            </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 pt-4 border-t border-light-outline-variant">
            <Link
                href={"/artists/" + pengguna.id}
                className="px-5 py-2.5 rounded-DEFAULT border border-light-outline text-light-on-surface font-medium hover:bg-warm-cream transition-colors text-body-sm"
            >
                Batal
            </Link>
            <TombolKirim
                teksMemuat="Menyimpan..."
                className="px-6 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-primary-hover transition-colors shadow-sm text-body-sm flex items-center gap-2"
            >
                Simpan Perubahan
            </TombolKirim>
            </div>
        </form>
        </div>
    );
}
