import Link from "next/link";
import { ImageOff } from "lucide-react";
import Masonry from "@/components/ui/Masonry";
import KeadaanKosong from "@/components/ui/KeadaanKosong";
import { ambilBanyak } from "@/lib/query";
import { cariKarya, SEMUA_KARYA } from "@/lib/karya";
import { denganRasio } from "@/lib/ukuranGambar";

export const metadata = { title: "Jelajahi Karya" };
export const dynamic = "force-dynamic";

const chip = "inline-flex items-center gap-1.5 h-9 px-4 rounded-full font-label text-label-lg shrink-0 transition-colors duration-state-change ";
const chipAktif = chip + "bg-primary text-on-primary";
const chipBiasa = chip + "bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container";

export default async function JelajahKarya({ searchParams }) {
    const sp = await searchParams;
    const kategori = typeof sp.kategori === "string" ? sp.kategori : "";

    const daftarKategori = await ambilBanyak("SELECT id, name FROM categories ORDER BY is_system ASC, name ASC");
    const hasil = await cariKarya({ kategori, urut: "terbaru", halaman: 1, perHalaman: SEMUA_KARYA });

    return (
        <main className="flex-1 bg-surface">
        <section aria-label="Filter kategori" className="bg-surface/95 border-b border-outline-variant">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
                <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface">Jelajahi Semua Karya</h1>
                <p className="font-body text-body-md text-on-surface-variant max-w-2xl">
                Temukan karya dari seluruh kategori kreatif dalam satu galeri, tanpa filter berdasarkan kebangsaan seniman.
                </p>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1" aria-label="Filter menurut kategori">
                <Link href="/artworks" aria-current={!kategori ? "true" : undefined} className={!kategori ? chipAktif : chipBiasa}>Semua Kategori</Link>
                {daftarKategori.map((k) => {
                const aktif = String(k.id) === kategori;
                return (
                    <Link key={k.id} href={"/artworks?kategori=" + k.id} aria-current={aktif ? "true" : undefined} className={aktif ? chipAktif : chipBiasa}>
                    {k.name}
                    </Link>
                );
                })}
            </div>
            </div>
        </section>

        <section aria-label="Daftar karya" className="py-10 lg:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {hasil.karya.length === 0 ? (
                <KeadaanKosong
                ikon={ImageOff}
                judul="Belum ada karya"
                deskripsi={kategori ? "Belum ada karya pada kategori ini. Coba kategori lain." : "Karya yang diunggah seniman akan tampil di galeri ini."}
                />
            ) : (
                <Masonry karya={denganRasio(hasil.karya)} />
            )}
            </div>
        </section>
        </main>
    );
}
