import Link from "next/link";
import { Clock, CalendarDays } from "lucide-react";
import GambarKarya from "@/components/ui/GambarKarya";
import KartuPotret from "@/components/ui/KartuPotret";
import StripKarya from "@/components/ui/StripKarya";
import Masonry from "@/components/ui/Masonry";
import { denganRasio } from "@/lib/ukuranGambar";
import { ambilBanyak } from "@/lib/query";
import { ambilSesi } from "@/lib/auth";
import { formatTanggalPendek, formatAngka } from "@/lib/format";
import { hariIni, hitungStatus, sisaHari } from "@/lib/challenge";

export const dynamic = "force-dynamic";

const SQL_ACAK = `
    SELECT a.id, a.title, a.file_url, u.display_name AS artis
    FROM artworks a JOIN users u ON u.id = a.user_id
    ORDER BY RANDOM() LIMIT $1`;

function bagiKolom(daftar, jumlah) {
    const kolom = Array.from({ length: jumlah }, () => ({ tinggi: 0, isi: [] }));
    for (const k of daftar) {
        let sasaran = kolom[0];
        for (const c of kolom) if (c.tinggi < sasaran.tinggi - 0.0001) sasaran = c;
        sasaran.isi.push(k);
        sasaran.tinggi += 1 / k.rasio;
    }
    return kolom.map((c) => c.isi);
}

function KolomHero({ isi, turun = false }) {
    return (
        <div className={"flex-1 min-w-0 flex flex-col gap-3 " + (turun ? "mt-16" : "")}>
        {isi.map((k) => (
            <Link
            key={k.id}
            href={"/artworks/" + k.id}
            aria-label={k.title + " oleh " + k.artis}
            className="block overflow-hidden rounded-lg bg-surface-container transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
            <GambarKarya src={k.file_url} alt={k.title + " oleh " + k.artis} className="block w-full h-auto" style={{ aspectRatio: String(k.rasio) }} />
            </Link>
        ))}
        </div>
    );
}

const JUMLAH_POPULER = 12;

const labelJuara = { 1: "Juara 1", 2: "Juara 2", 3: "Juara 3" };
const medali = { 1: "🥇", 2: "🥈", 3: "🥉" };

function TeksKarya({ k }) {
    return (
        <>
        <span className="font-label text-label-md text-outline truncate max-w-full">{k.artis}</span>
        <span className="font-title text-title-md text-on-surface truncate max-w-full">{k.title}</span>
        <span className="font-body text-body-sm text-on-surface-variant tabular-nums">
            {Number(k.jumlah_like) > 0 ? "disukai oleh " + formatAngka(k.jumlah_like) + " orang" : "belum ada yang menyukai"}
        </span>
        </>
    );
}

export default async function Beranda() {
    const tanggal = hariIni();
    const sesi = await ambilSesi();

    const karyaHero = denganRasio(await ambilBanyak(SQL_ACAK, [12]));
    const kolomHero = [...bagiKolom(karyaHero.slice(0, 6), 2), ...bagiKolom(karyaHero.slice(6, 12), 2)];

    const karyaPopuler = await ambilBanyak(
        `SELECT a.id, a.title, a.file_url, u.display_name AS artis, u.is_active,
                (SELECT COUNT(*) FROM likes l WHERE l.artwork_id = a.id) AS jumlah_like
        FROM artworks a JOIN users u ON u.id = a.user_id
        ORDER BY jumlah_like DESC, a.view_count DESC, a.created_at DESC
        LIMIT ${JUMLAH_POPULER}`
    );

    const challenge = await ambilBanyak(
        `SELECT ch.id, ch.title, ch.tagline, ch.prize, ch.banner_url, ch.start_date, ch.end_date,
                ch.curator_id, u.display_name AS curator,
                (SELECT COUNT(*) FROM submissions s WHERE s.challenge_id = ch.id) AS jumlah_submisi
        FROM challenges ch JOIN users u ON u.id = ch.curator_id
        WHERE ch.end_date >= $1
        ORDER BY (ch.start_date <= $1) DESC, ch.end_date ASC
        LIMIT 2`,
        [tanggal]
    );

    const pemenang = await ambilBanyak(
        `SELECT w.rank, a.id, a.title, a.file_url, u.display_name AS artis, u.is_active,
                (SELECT COUNT(*) FROM likes l WHERE l.artwork_id = a.id) AS jumlah_like
        FROM winners w
        JOIN submissions s ON s.id = w.submission_id
        JOIN artworks a ON a.id = s.artwork_id
        JOIN users u ON u.id = a.user_id
        WHERE w.challenge_id = (SELECT challenge_id FROM winners ORDER BY created_at DESC LIMIT 1)
        ORDER BY w.rank ASC`
    );
    const judulSeksi = "font-headline text-headline-lg-mobile md:text-headline-lg text-on-surface";
    const tombolUtama = "inline-flex items-center justify-center h-10 px-5 rounded bg-primary text-on-primary hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-state-change font-label text-label-lg";
    const tombolSekunder = "inline-flex items-center justify-center h-10 px-5 rounded bg-surface text-on-surface-variant border border-border-input hover:bg-surface-container-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-state-change font-label text-label-lg";

    return (
        <main className="flex-1">
        <section aria-label="Sambutan galeri" className="bg-surface border-b border-outline-variant overflow-hidden lg:h-[calc(100svh-65px)] lg:min-h-[520px] lg:max-h-[760px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-0 lg:h-full relative flex flex-col gap-8 lg:block">
            <div className="hidden lg:flex absolute top-0 bottom-0 left-8 w-[26%] gap-3 pt-6 overflow-hidden" aria-label="Karya pilihan acak">
                <KolomHero isi={kolomHero[0]} />
                <KolomHero isi={kolomHero[1]} turun />
            </div>
            <div className="hidden lg:flex absolute top-0 bottom-0 right-8 w-[26%] gap-3 pt-6 overflow-hidden" aria-hidden="true">
                <KolomHero isi={kolomHero[2]} turun />
                <KolomHero isi={kolomHero[3]} />
            </div>

            <div className="lg:absolute lg:inset-0 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto w-full max-w-xl lg:max-w-[40%] py-8 lg:py-10 px-4 text-center flex flex-col items-center justify-center gap-4 lg:gap-5">
                <span className="font-label text-label-md text-on-primary-container bg-primary-container px-3 py-1 rounded-full">
                    Pameran Seni Global
                </span>
                <h1 className="font-display text-display-lg-mobile lg:text-display-lg text-on-surface text-balance">
                    Ruang Global untuk Suara-Suara Kreatif
                </h1>
                <p className="font-body text-body-md lg:text-body-lg text-on-surface-variant max-w-md text-pretty">
                    Temukan lukisan, gambar, tekstil, dan patung dari seniman independen di seluruh dunia — terbuka untuk dijelajahi, diapresiasi, dan ditantang.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <Link href="/artworks" className={tombolUtama}>Jelajahi Galeri</Link>
                    <Link href="/challenges" className={tombolSekunder}>Ikuti Challenge</Link>
                </div>
                </div>
            </div>

            {karyaHero.length > 0 && (
                <div className="lg:hidden">
                <Masonry karya={karyaHero.slice(0, 6)} kolom={2} />
                </div>
            )}
            </div>
        </section>

        <section id="populer" className="py-12 border-b border-outline-variant bg-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <StripKarya
                judul="Karya Terpopuler"
                deskripsi="Karya yang paling banyak disukai komunitas. Geser ke samping untuk melihat lebih banyak karya."
            >
                {karyaPopuler.length === 0 ? (
                <p className="font-body text-body-sm text-outline py-8">Belum ada karya. Karya yang diunggah seniman akan tampil di sini.</p>
                ) : (
                <>
                    {karyaPopuler.map((k, i) => (
                    <KartuPotret
                        key={k.id}
                        href={"/artworks/" + k.id}
                        src={k.file_url}
                        alt={k.title + " oleh " + k.artis}
                        label={i < 5 ? <><span aria-hidden="true">🔥</span> Terpopuler</> : null}
                        nonaktif={!k.is_active}
                        className="w-44 sm:w-52 shrink-0 snap-start"
                    >
                        <TeksKarya k={k} />
                    </KartuPotret>
                    ))}
                </>
                )}
            </StripKarya>
            </div>
        </section>


        <section id="challenge" className="py-12 lg:py-16 bg-surface-container-low border-b border-outline-variant">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div className="flex flex-col gap-1">
                <h2 className={judulSeksi}>Art Challenge</h2>
                <p className="font-body text-body-md text-on-surface-variant">
                    Ikutkan satu karya dari portofolio Anda ke pameran bertema yang dikurasi para Curator.
                </p>
                </div>
                <Link href="/challenges" className="font-label text-label-lg text-primary hover:underline shrink-0">Semua challenge</Link>
            </div>

            {challenge.length === 0 ? (
                <div className="rounded-md border border-dashed border-border-input bg-surface-container-low p-10 text-center font-body text-body-sm text-on-surface-variant">
                Belum ada challenge yang aktif atau akan datang. Lihat <Link href="/challenges?status=berakhir" className="text-primary underline">challenge yang sudah selesai</Link>.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {challenge.map((c) => {
                    const status = hitungStatus(c.start_date, c.end_date);
                    const aktif = status === "aktif";
                    const sisa = sisaHari(c.end_date);
                    return (
                    <article key={c.id} className="rounded-md bg-surface border border-outline-variant shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="aspect-[16/9] bg-surface-container overflow-hidden relative">
                        <img src={c.banner_url || "/images/placeholder-banner.svg"} alt={"Banner challenge " + c.title} className="w-full h-full object-cover" />
                        <span className={"absolute top-3 left-3 inline-flex items-center px-2.5 py-0.5 rounded-full shadow-sm font-label text-label-md " + (aktif ? "bg-success-container text-on-success-container" : "bg-info-container text-on-info-container")}>
                            {aktif ? "Aktif" : "Segera Hadir"}
                        </span>
                        </div>
                        <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between gap-2 text-outline">
                            <span className="font-label text-label-md truncate">Dikurasi oleh <Link href={"/curators/" + c.curator_id} className="hover:underline hover:text-on-surface">{c.curator}</Link></span>
                            <span className="font-label text-label-md inline-flex items-center gap-1 tabular-nums shrink-0">
                                {aktif ? (
                                <><Clock className="w-4 h-4" aria-hidden="true" /> {sisa <= 0 ? "Berakhir hari ini" : "Berakhir dalam " + sisa + " hari"}</>
                                ) : (
                                <><CalendarDays className="w-4 h-4" aria-hidden="true" /> Mulai {formatTanggalPendek(c.start_date)}</>
                                )}
                            </span>
                            </div>
                            <h3 className="font-title text-title-lg text-on-surface">{c.title}</h3>
                            {c.tagline && <p className="font-body text-body-md text-on-surface-variant">{c.tagline}</p>}
                            {c.prize && <p className="font-body text-body-sm text-outline pt-1">Hadiah: {c.prize}</p>}
                        </div>
                        <div className="pt-3 border-t border-outline-variant flex items-center justify-between gap-4">
                            <span className="font-body text-body-sm text-on-surface-variant tabular-nums">
                            {aktif ? formatAngka(c.jumlah_submisi) + " submisi" : "Terbuka untuk semua Member"}
                            </span>
                            <Link href={"/challenges/" + c.id} className={aktif ? tombolUtama : tombolSekunder}>
                            {aktif ? "Lihat & Ikuti" : "Lihat Detail"}
                            </Link>
                        </div>
                        </div>
                    </article>
                    );
                })}
                </div>
            )}
            </div>
        </section>

        {pemenang.length > 0 && (
        <section id="unggulan" className="py-12 lg:py-16 bg-surface border-b border-outline-variant">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-1 mb-8">
                <h2 className={judulSeksi}>Pemenang Challenge Unggulan</h2>
                <p className="font-body text-body-md text-on-surface-variant">
                Karya berpenghargaan dari pameran yang baru berakhir, diapresiasi karena orisinalitas dan kerajinannya.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8 max-w-2xl">
                {pemenang.map((p) => (
                <KartuPotret
                    key={p.id}
                    href={"/artworks/" + p.id}
                    src={p.file_url}
                    alt={p.title + " oleh " + p.artis}
                    label={<>{medali[p.rank]} {labelJuara[p.rank]}</>}
                    nonaktif={!p.is_active}
                >
                    <TeksKarya k={p} />
                </KartuPotret>
                ))}
            </div>
            </div>
        </section>
        )}

        {!sesi && (
            <section id="gabung" className="py-12 lg:py-16 bg-surface">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-5">
                <h2 className={judulSeksi + " text-balance"}>Bagikan Kreativitas Anda Tanpa Batas</h2>
                <p className="font-body text-body-md lg:text-body-lg text-on-surface-variant max-w-xl text-pretty">
                Bergabunglah sebagai Member untuk memamerkan portofolio, mengapresiasi sesama seniman, dan mengikuti challenge bertema — atau daftar sebagai Curator untuk menyelenggarakan pameran Anda sendiri.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <Link href="/register" className={tombolUtama}>Buat Akun Member</Link>
                <Link href="/register" className={tombolSekunder}>Daftar sebagai Curator</Link>
                </div>
            </div>
            </section>
        )}
        </main>
    );
}
