import Link from "next/link";
import { notFound } from "next/navigation";
import { Globe } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import TombolKembali from "@/components/layout/TombolKembali";
import SubNavbarPeran from "@/components/layout/SubNavbarPeran";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import Masonry from "@/components/ui/Masonry";
import { denganRasio } from "@/lib/ukuranGambar";
import KeadaanKosong from "@/components/ui/KeadaanKosong";
import { ambilBanyak, ambilSatu } from "@/lib/query";
import { ambilPengguna } from "@/lib/auth";
import { ubahKeId } from "@/lib/validasi";
import { formatTahun, formatAngka } from "@/lib/format";
import { bacaTautan } from "@/lib/tautan";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
    const { id } = await params;
    const idAngka = ubahKeId(id);
    const s = idAngka ? await ambilSatu("SELECT display_name FROM users WHERE id = $1 AND role = 'member'", [idAngka]) : null;
    return { title: s ? s.display_name : "Profil Seniman" };
}

export default async function ProfilSeniman({ params, searchParams }) {
    const { id } = await params;
    const { sukses } = await searchParams;
    const idSeniman = ubahKeId(id);
    if (!idSeniman) notFound();

    const pengguna = await ambilPengguna();

    const s = await ambilSatu(
        `SELECT id, display_name, is_active, avatar_url, bio, country, external_links, created_at,
                (SELECT COUNT(*) FROM artworks a WHERE a.user_id = users.id) AS jumlah_karya,
                (SELECT COUNT(*) FROM likes l JOIN artworks a ON a.id = l.artwork_id WHERE a.user_id = users.id) AS jumlah_like,
                (SELECT COUNT(*) FROM submissions sb WHERE sb.user_id = users.id) AS jumlah_challenge
        FROM users WHERE id = $1 AND role = 'member'`,
        [idSeniman]
    );
    if (!s) notFound();

    const karya = await ambilBanyak(
        `SELECT a.id, a.title, a.file_url, a.created_at, c.name AS kategori,
                (SELECT COUNT(*) FROM likes l WHERE l.artwork_id = a.id) AS jumlah_like,
                (SELECT COUNT(*) FROM favorites f WHERE f.artwork_id = a.id) AS jumlah_simpan
        FROM artworks a JOIN categories c ON c.id = a.category_id
        WHERE a.user_id = $1 ORDER BY a.created_at DESC`,
        [idSeniman]
    );
    const daftarTautan = bacaTautan(s.external_links);

    const meta = "font-label text-label-md text-outline";
    const adalahPemilik = Boolean(pengguna && pengguna.role === "member" && pengguna.id === s.id);

    return (
        <main className="flex-1 bg-surface">
        {adalahPemilik && <SubNavbarPeran tema="member" idPengguna={pengguna.id} />}
        <section aria-label="Profil seniman" className="bg-surface/95 border-b border-outline-variant">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <TombolKembali bawaan={{ href: "/artists", label: "Komunitas" }} />
                {adalahPemilik && (
                    <Link
                        href="/member/profile"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-DEFAULT bg-light-primary text-light-on-primary text-body-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
                    >
                        Edit Profil
                    </Link>
                )}
            </div>
            {sukses && <div className="mb-6"><Pemberitahuan sukses={sukses} /></div>}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-5 flex items-start gap-5">
                <Avatar nama={s.display_name} src={s.avatar_url} ukuran="w-20 h-20 sm:w-24 sm:h-24 shrink-0" teks="text-3xl" />
                <div className="flex flex-col gap-1.5 min-w-0">
                    <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface">{s.display_name}</h1>
                    {!s.is_active && (
                    <span className="self-start inline-flex px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-label-sm font-medium">Akun nonaktif</span>
                    )}
                    {s.country && (
                    <div className="flex items-center gap-1.5 pt-1">
                        <Globe className="w-[18px] h-[18px] text-outline" aria-hidden="true" />
                        <span className="font-body text-body-sm text-on-surface-variant">{s.country}</span>
                    </div>
                    )}
                </div>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-6">
                {s.bio && (
                    <div className="font-body text-body-md lg:text-body-lg text-on-surface-variant max-w-prose text-pretty space-y-3">
                    {s.bio.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
                    </div>
                )}

                <div className={"grid grid-cols-2 gap-6 pt-4 border-t border-outline-variant " + (daftarTautan.length > 0 ? "sm:grid-cols-3" : "")}>
                    {daftarTautan.length > 0 && (
                    <div className="col-span-2 sm:col-span-1 flex flex-col gap-0.5">
                        <span className={meta}>Tautan Eksternal</span>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {daftarTautan.map((t, i) => (
                            <a key={i} href={t.url} target="_blank" rel="noopener noreferrer" className="font-label text-label-lg text-on-surface hover:underline">
                            {t.judul}
                            </a>
                        ))}
                        </div>
                    </div>
                    )}
                    <div className="flex flex-col gap-0.5">
                    <span className={meta}>Karya Terbit</span>
                    <span className="font-body text-body-md text-on-surface tabular-nums">{formatAngka(s.jumlah_karya)} karya</span>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:items-end sm:text-right">
                    <span className={meta}>Bergabung</span>
                    <span className="font-body text-body-md text-on-surface tabular-nums">Sejak {formatTahun(s.created_at)}</span>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </section>

        <section id="karya-seniman" aria-label="Karya seniman" className="py-10 lg:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h2 className="font-headline text-headline-md text-on-surface">Karya Pilihan</h2>
                <div className="flex items-center gap-4">
                    <span className="font-body text-body-sm text-outline tabular-nums">{formatAngka(karya.length)} karya</span>
                    {adalahPemilik && (
                        <Link
                            href="/member/artworks"
                            className="inline-flex items-center justify-center px-4 py-2 rounded-DEFAULT border border-light-outline bg-light-surface text-light-on-surface text-body-sm font-medium hover:bg-warm-cream transition-colors"
                        >
                            Edit Karya
                        </Link>
                    )}
                </div>
            </div>
            {karya.length === 0 ? (
                <KeadaanKosong judul="Belum ada karya" deskripsi="Seniman ini belum mengunggah karya." />
            ) : (
                <Masonry karya={denganRasio(karya).map((k) => ({ ...k, is_active: s.is_active }))} />
            )}
            </div>
        </section>
        </main>
    );
}
