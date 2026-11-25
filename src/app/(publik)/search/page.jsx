import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import Masonry from "@/components/ui/Masonry";
import KeadaanKosong from "@/components/ui/KeadaanKosong";
import Avatar from "@/components/ui/Avatar";
import { ambilBanyak } from "@/lib/query";
import { denganRasio } from "@/lib/ukuranGambar";
import { hitungStatus, labelStatus } from "@/lib/challenge";
import { formatAngka } from "@/lib/format";

export const metadata = { title: "Hasil Pencarian" };
export const dynamic = "force-dynamic";

const BATAS_SENIMAN = 8;
const BATAS_CHALLENGE = 6;

export default async function HalamanCari({ searchParams }) {
    const sp = await searchParams;
    const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";

    const pola = "%" + q.replace(/[\\%_]/g, "\\$&") + "%";

    let karya = [], seniman = [], kategori = [], challenge = [];
    if (q) {
        karya = await ambilBanyak(
        `SELECT a.id, a.title, a.file_url, u.display_name AS artis, u.is_active
        FROM artworks a
        JOIN users u ON u.id = a.user_id
        WHERE a.title ILIKE $1 OR u.display_name ILIKE $1
            OR EXISTS (SELECT 1 FROM artwork_tags at JOIN tags t ON t.id = at.tag_id WHERE at.artwork_id = a.id AND t.name ILIKE $1)
        ORDER BY a.created_at DESC`,
        [pola]
        );

        seniman = await ambilBanyak(
        `SELECT u.id, u.display_name, u.is_active, u.avatar_url,
                (SELECT COUNT(*) FROM artworks a WHERE a.user_id = u.id) AS jumlah_karya
        FROM users u
        WHERE u.role = 'member' AND u.display_name ILIKE $1
        ORDER BY LOWER(u.display_name) ASC
        LIMIT ${BATAS_SENIMAN}`,
        [pola]
        );

        kategori = await ambilBanyak(
        `SELECT c.id, c.name, COUNT(a.id) AS jumlah
        FROM categories c LEFT JOIN artworks a ON a.category_id = c.id
        WHERE c.name ILIKE $1
        GROUP BY c.id, c.name, c.is_system
        ORDER BY c.is_system ASC, c.name ASC`,
        [pola]
        );

        const baris = await ambilBanyak(
        `SELECT ch.id, ch.title, ch.tagline, ch.start_date, ch.end_date, u.display_name AS curator
        FROM challenges ch JOIN users u ON u.id = ch.curator_id
        WHERE ch.title ILIKE $1 OR ch.tagline ILIKE $1
        ORDER BY ch.start_date DESC
        LIMIT ${BATAS_CHALLENGE}`,
        [pola]
        );
        challenge = baris.map((c) => ({ ...c, status: hitungStatus(c.start_date, c.end_date) }));
    }

    const adaHasil = karya.length + seniman.length + kategori.length + challenge.length > 0;
    const judulBagian = "font-headline text-headline-md text-on-surface";
    const kelasStatus = {
        aktif: "bg-success-container text-on-success-container",
        belum_mulai: "bg-info-container text-on-info-container",
        berakhir: "bg-surface-container text-on-surface-variant",
    };

    return (
        <main className="flex-1 bg-surface">
        <section aria-label="Pencarian" className="bg-surface/95 border-b border-outline-variant">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
                <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface">
                {q ? "Hasil untuk “" + q + "”" : "Cari di Creosphere"}
                </h1>
                <p className="font-body text-body-md text-on-surface-variant max-w-2xl">
                Cari karya, seniman, kategori, dan challenge dalam satu tempat.
                </p>
            </div>
            </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 flex flex-col gap-14">
            {!q && (
            <KeadaanKosong ikon={Search} judul="Mulai mencari" deskripsi="Ketik judul karya, nama atau tag, nama seniman, kategori, atau judul challenge pada kolom pencarian di bagian atas halaman." />
            )}
            {q && !adaHasil && (
            <KeadaanKosong ikon={SearchX} judul={"Tidak ada hasil untuk “" + q + "”"} deskripsi="Periksa ejaan kata kunci atau coba kata yang lebih umum." />
            )}

            {karya.length > 0 && (
            <section aria-label="Hasil karya" className="flex flex-col gap-6">
                <div className="flex items-baseline justify-between gap-4 border-b border-outline-variant pb-3">
                <h2 className={judulBagian}>Karya</h2>
                <span className="font-body text-body-sm text-outline tabular-nums">
                    {formatAngka(karya.length) + " karya"}
                </span>
                </div>
                <Masonry karya={denganRasio(karya)} />
            </section>
            )}

            {seniman.length > 0 && (
            <section aria-label="Hasil seniman" className="flex flex-col gap-6">
                <div className="flex items-baseline justify-between gap-4 border-b border-outline-variant pb-3">
                <h2 className={judulBagian}>Seniman</h2>
                <span className="font-body text-body-sm text-outline tabular-nums">{formatAngka(seniman.length)} seniman</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {seniman.map((s, i) => (
                    <Link key={s.id} href={"/artists/" + s.id} className="group flex items-center gap-5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Avatar nama={s.display_name} src={s.avatar_url} ukuran="w-16 h-16 shrink-0" teks="text-xl" indeksWarna={i + 1} />
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <h3 className="font-title text-title-md text-on-surface truncate group-hover:underline">{s.display_name}</h3>
                        <p className="font-label text-label-md text-outline tabular-nums">{formatAngka(s.jumlah_karya)} karya</p>
                    </div>
                    </Link>
                ))}
                </div>
            </section>
            )}

            {kategori.length > 0 && (
            <section aria-label="Hasil kategori" className="flex flex-col gap-6">
                <div className="border-b border-outline-variant pb-3"><h2 className={judulBagian}>Kategori</h2></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {kategori.map((k) => (
                    <Link key={k.id} href={"/artworks?kategori=" + k.id} className="rounded-md bg-surface border border-outline-variant p-4 flex flex-col gap-0.5 hover:border-primary transition-colors duration-state-change focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <h3 className="font-title text-title-md text-on-surface truncate">{k.name}</h3>
                    <p className="font-body text-body-sm text-outline tabular-nums">{formatAngka(k.jumlah)} karya</p>
                    </Link>
                ))}
                </div>
            </section>
            )}

            {challenge.length > 0 && (
            <section aria-label="Hasil challenge" className="flex flex-col gap-6">
                <div className="border-b border-outline-variant pb-3"><h2 className={judulBagian}>Challenge</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenge.map((c) => (
                    <Link key={c.id} href={"/challenges/" + c.id} className="rounded-md bg-surface border border-outline-variant p-5 flex flex-col gap-2 hover:border-primary transition-colors duration-state-change focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-label text-label-md text-outline truncate">Dikurasi oleh {c.curator}</span>
                        <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-label-md shrink-0 " + kelasStatus[c.status]}>{labelStatus[c.status]}</span>
                    </div>
                    <h3 className="font-title text-title-lg text-on-surface">{c.title}</h3>
                    {c.tagline && <p className="font-body text-body-md text-on-surface-variant">{c.tagline}</p>}
                    </Link>
                ))}
                </div>
            </section>
            )}
        </div>
        </main>
    );
}
