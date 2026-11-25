import Link from "next/link";
import NavbarPublik from "@/components/layout/NavbarPublik";
import TombolKembali from "@/components/layout/TombolKembali";
import FooterPublik from "@/components/layout/FooterPublik";
import { wajibPeran } from "@/lib/auth";
import { ambilSatu } from "@/lib/query";
import { kelasInput, kelasLabel } from "@/lib/gaya";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import TombolKirim from "@/components/ui/TombolKirim";
import UnggahGambar from "@/components/ui/UnggahGambar";
import FormTautan from "@/components/ui/FormTautan";
import { bacaTautan, MAKS_TAUTAN } from "@/lib/tautan";
import { simpanProfilCurator } from "../(dashboard)/actions";

export const metadata = { title: "Edit Profil Curator" };
export const dynamic = "force-dynamic";

export default async function EditProfilCurator({ searchParams }) {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });
    const { galat, sukses } = await searchParams;

    const profil = (await ambilSatu(
        "SELECT display_name, headline, bio, country, external_links, specialization, affiliation, avatar_url FROM users WHERE id = $1",
        [pengguna.id]
    )) || {};

    const tautan = bacaTautan(profil.external_links);

    return (
        <>
        <NavbarPublik />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            <div className="mb-6">
                <TombolKembali bawaan={{ href: "/curators/" + pengguna.id, label: "Profil Curator" }} />
            </div>
            <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="font-headline text-headline-lg text-light-on-surface mb-2">Edit Profil Curator</h1>
                <p className="text-body-md text-light-on-surface-variant">
                Jaga kredensial institusi, fokus kuratorial, dan detail organisasi terverifikasi Anda.
                </p>
            </div>

            <Pemberitahuan galat={galat} sukses={sukses} />

            <form action={simpanProfilCurator} className="space-y-8 bg-light-surface rounded-xl border border-light-outline-variant p-6 md:p-8 shadow-sm">
                <div className="pb-6 border-b border-light-outline-variant">
                <UnggahGambar nama="avatar_url" jenis="avatars" bentuk="bulat" nilaiAwal={profil.avatar_url || ""} bantuan="Disarankan gambar persegi 1:1 (maks. 2 MB)." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="display_name" className={kelasLabel}>Nama Organisasi / Kurator Utama <span className="text-danger">*</span></label>
                    <input type="text" id="display_name" name="display_name" required maxLength={50} defaultValue={profil.display_name || ""} className={kelasInput} />
                </div>
                <div>
                    <label htmlFor="headline" className={kelasLabel}>Jabatan Profesional <span className="text-danger">*</span></label>
                    <input type="text" id="headline" name="headline" required maxLength={100} defaultValue={profil.headline || ""} className={kelasInput} />
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label htmlFor="specialization" className={kelasLabel}>Spesialisasi Kuratorial</label>
                    <input type="text" id="specialization" name="specialization" maxLength={100} defaultValue={profil.specialization || ""} className={kelasInput} />
                </div>
                <div>
                    <label htmlFor="affiliation" className={kelasLabel}>Afiliasi Institusi</label>
                    <input type="text" id="affiliation" name="affiliation" maxLength={100} defaultValue={profil.affiliation || ""} className={kelasInput} />
                </div>
                </div>

                <div>
                <label htmlFor="bio" className={kelasLabel}>Biografi &amp; Misi Curator</label>
                <textarea id="bio" name="bio" rows={4} maxLength={500} defaultValue={profil.bio || ""} className="w-full p-3.5 rounded bg-light-surface border border-light-outline text-body-md focus:border-light-primary focus:ring-1 focus:ring-light-primary" />
                <span className="text-xs text-light-on-surface-variant mt-1 block">Maksimal 500 karakter.</span>
                </div>

                <div>
                <label htmlFor="country" className={kelasLabel}>Negara (Opsional)</label>
                <input type="text" id="country" name="country" maxLength={60} defaultValue={profil.country || ""} className={kelasInput} />
                </div>

                <div className="space-y-3">
                <span className={kelasLabel}>
                    Tautan Eksternal <span className="text-xs text-light-on-surface-variant font-normal">(Opsional, maksimal {MAKS_TAUTAN})</span>
                </span>
                <FormTautan awal={tautan} maks={MAKS_TAUTAN} />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-4 pt-4 border-t border-light-outline-variant">
                <Link href={"/curators/" + pengguna.id} className="px-5 py-2.5 rounded border border-light-outline text-body-sm font-medium hover:bg-warm-cream">
                    Batal
                </Link>
                <TombolKirim className="px-6 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-primary-hover text-body-sm shadow-sm">
                    Simpan Profil
                </TombolKirim>
                </div>
            </form>
            </div>
        </main>
        <FooterPublik />
        </>
    );
}
