import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Clock, CalendarDays } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import KeadaanKosong from "@/components/ui/KeadaanKosong";
import Pemberitahuan from "@/components/ui/Pemberitahuan";
import SubNavbarPeran from "@/components/layout/SubNavbarPeran";
import { ambilBanyak, ambilSatu } from "@/lib/query";
import { ambilPengguna } from "@/lib/auth";
import { ubahKeId } from "@/lib/validasi";
import { formatBulanTahun, formatAngka, formatTanggalPendek } from "@/lib/format";
import { hitungStatus, labelStatus, sisaHari } from "@/lib/challenge";
import { bacaTautan } from "@/lib/tautan";

export const dynamic = "force-dynamic";

const SYARAT_TAMPIL = "role = 'curator' AND status = 'approved'";

// Urutan tampil challenge di profil curator: aktif dulu, lalu segera hadir, terakhir yang selesai
const urutanStatus = { aktif: 0, belum_mulai: 1, berakhir: 2 };

// Warna lencana status di pojok banner (sama dengan yang dipakai di halaman search)
const kelasStatus = {
    aktif: "bg-success-container text-on-success-container",
    belum_mulai: "bg-info-container text-on-info-container",
    berakhir: "bg-surface-container text-on-surface-variant",
};

export async function generateMetadata({ params }) {
    const { id } = await params;
    const idAngka = ubahKeId(id);
    const c = idAngka ? await ambilSatu("SELECT display_name FROM users WHERE id = $1 AND " + SYARAT_TAMPIL, [idAngka]) : null;
    return { title: c ? c.display_name : "Profil Curator" };
}

export default async function ProfilCurator({ params, searchParams }) {
    const { id } = await params;
    const { sukses } = await searchParams;
    const idCurator = ubahKeId(id);
    if (!idCurator) notFound();

    const pengguna = await ambilPengguna();

    const c = await ambilSatu(
        `SELECT id, display_name, is_active, avatar_url, headline, bio, country, external_links, specialization, affiliation, created_at,
                (SELECT COUNT(*) FROM challenges ch WHERE ch.curator_id = users.id) AS jumlah_challenge,
                (SELECT COUNT(*) FROM submissions s JOIN challenges ch ON ch.id = s.challenge_id WHERE ch.curator_id = users.id) AS jumlah_submisi
        FROM users WHERE id = $1 AND ${SYARAT_TAMPIL}`,
        [idCurator]
    );
    if (!c) notFound();

    const baris = await ambilBanyak(
        `SELECT ch.id, ch.title, ch.tagline, ch.prize, ch.banner_url, ch.start_date, ch.end_date,
                (SELECT COUNT(*) FROM submissions s WHERE s.challenge_id = ch.id) AS jumlah_submisi,
                (SELECT COUNT(*) FROM winners w WHERE w.challenge_id = ch.id) AS jumlah_pemenang
        FROM challenges ch WHERE ch.curator_id = $1
        ORDER BY ch.start_date DESC`,
        [idCurator]
    );
    
    const challenge = baris
        .map((x) => ({ ...x, status: hitungStatus(x.start_date, x.end_date) }))
        .sort((a, b) => urutanStatus[a.status] - urutanStatus[b.status]);

    const daftarTautan = bacaTautan(c.external_links);

    const meta = "font-label text-label-md text-outline";
    const subjudul = [c.headline, c.affiliation, c.specialization].filter(Boolean);
    const adalahPemilik = Boolean(pengguna && pengguna.role === "curator" && pengguna.id === c.id);

    return (
        <main className="flex-1 bg-surface">
        {adalahPemilik && <SubNavbarPeran tema="curator" idPengguna={pengguna.id} />}
        <section aria-label="Profil curator" className="bg-surface/95 border-b border-outline-variant">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 font-label text-label-lg text-on-surface-variant hover:text-on-surface hover:underline underline-offset-4 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Kembali ke Beranda</span>
                </Link>
                {adalahPemilik && (
                    <Link
                        href="/curator/profile"
                        className="inline-flex items-center justify-center px-4 py-2 rounded-DEFAULT bg-light-primary text-light-on-primary text-body-sm font-medium hover:bg-primary-hover transition-colors shadow-sm"
                    >
                        Edit Profil
                    </Link>
                )}
            </div>
            {sukses && <div className="mb-6"><Pemberitahuan sukses={sukses} /></div>}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                <div className="lg:col-span-5 flex items-start gap-5">
                <Avatar nama={c.display_name} src={c.avatar_url} ukuran="w-20 h-20 sm:w-24 sm:h-24 shrink-0" teks="text-3xl" />
                <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="self-start font-label text-label-md text-on-primary-container bg-primary-container px-2.5 py-0.5 rounded-full">Curator</span>
                    {!c.is_active && (
                    <span className="self-start inline-flex px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-label-sm font-medium">Akun nonaktif</span>
                    )}
                    <h1 className="font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface">{c.display_name}</h1>
                    {subjudul.length > 0 && <p className="font-body text-body-md text-outline">{subjudul.join(" · ")}</p>}
                    {c.country && (
                    <div className="flex items-center gap-1.5 pt-1">
                        <Globe className="w-[18px] h-[18px] text-outline" aria-hidden="true" />
                        <span className="font-body text-body-sm text-on-surface-variant">{c.country}</span>
                    </div>
                    )}
                </div>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="font-body text-body-md lg:text-body-lg text-on-surface-variant max-w-prose text-pretty space-y-3">
                    {c.bio ? c.bio.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>) : <p>Curator ini belum menulis bio.</p>}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-outline-variant">
                    <div className="flex flex-col gap-0.5">
                    <span className={meta}>Bergabung di Creosphere</span>
                    <span className="font-body text-body-md text-on-surface tabular-nums">Sejak {formatBulanTahun(c.created_at)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                    <span className={meta}>Challenge Dibuat</span>
                    <span className="font-body text-body-md text-on-surface tabular-nums">{formatAngka(c.jumlah_challenge)} challenge</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                    <span className={meta}>Submisi Diterima</span>
                    <span className="font-body text-body-md text-on-surface tabular-nums">{formatAngka(c.jumlah_submisi)} karya</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                    <span className={meta}>Tautan Eksternal</span>
                    {daftarTautan.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-3">
                        {daftarTautan.map((t, i) => (
                            <a key={i} href={t.url} target="_blank" rel="noopener noreferrer" className="font-label text-label-lg text-on-surface hover:underline">
                            {t.judul}
                            </a>
                        ))}
                        </div>
                    ) : (
                        <span className="font-body text-body-md text-outline">Belum ada</span>
                    )}
                    </div>
                </div>
                </div>
            </div>
            </div>
        </section>

        <section id="challenge-curator" aria-label="Challenge oleh curator" className="py-10 lg:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 mb-8">
                <h2 className="font-headline text-headline-md text-on-surface">Challenge oleh {c.display_name}</h2>
                <span className="font-body text-body-sm text-outline tabular-nums">{formatAngka(challenge.length)} challenge</span>
            </div>

            {challenge.length === 0 ? (
                <KeadaanKosong judul="Belum ada challenge" deskripsi="Curator ini belum membuat challenge." />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {challenge.map((x) => (
                    <Link
                    key={x.id}
                    href={"/challenges/" + x.id}
                    className="group rounded-md bg-surface border border-outline-variant shadow-sm overflow-hidden flex flex-col h-full transition-transform duration-surface-enter hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                    <div className="aspect-[16/9] bg-surface-container overflow-hidden relative">
                        <img src={x.banner_url || "/images/placeholder-banner.svg"} alt={"Banner challenge " + x.title} className="w-full h-full object-cover" />
                        <span className={"absolute top-3 left-3 inline-flex items-center px-2.5 py-0.5 rounded-full shadow-sm font-label text-label-md " + kelasStatus[x.status]}>
                        {x.status === "berakhir" && x.jumlah_pemenang > 0 ? "Pemenang Diumumkan" : labelStatus[x.status]}
                        </span>
                    </div>
                    <div className="p-5 flex flex-col flex-1 gap-2">
                        <h3 className="font-title text-title-lg text-on-surface group-hover:underline">{x.title}</h3>
                        {x.tagline && <p className="font-body text-body-md text-on-surface-variant">{x.tagline}</p>}
                        <div className="mt-auto pt-3 flex items-center justify-between gap-3 font-label text-label-md text-outline tabular-nums">
                        <span>{formatAngka(x.jumlah_submisi)} submisi</span>
                        <span className="inline-flex items-center gap-1">
                            {x.status === "aktif" ? (
                            <><Clock className="w-4 h-4" aria-hidden="true" /> {sisaHari(x.end_date) <= 0 ? "Berakhir hari ini" : "Berakhir dalam " + sisaHari(x.end_date) + " hari"}</>
                            ) : x.status === "belum_mulai" ? (
                            <><CalendarDays className="w-4 h-4" aria-hidden="true" /> Mulai {formatTanggalPendek(x.start_date)}</>
                            ) : (
                            <>Berakhir {formatTanggalPendek(x.end_date)}</>
                            )}
                        </span>
                        </div>
                    </div>
                    </Link>
                ))}
                </div>
            )}
            </div>
        </section>
        </main>
    );
}