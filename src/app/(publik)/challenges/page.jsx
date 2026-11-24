    import Link from "next/link";
    import { ArrowRight, Award, Trophy, Flag } from "lucide-react";
    import GambarKarya from "@/components/ui/GambarKarya";
    import KeadaanKosong from "@/components/ui/KeadaanKosong";
    import { ambilBanyak } from "@/lib/query";
    import { hitungStatus, sisaHari } from "@/lib/challenge";
    import { formatTanggal } from "@/lib/format";

    export const metadata = { title: "Challenge Seni" };
    export const dynamic = "force-dynamic";

    const TAB = [
    { kunci: "aktif", label: "Challenge Aktif" },
    { kunci: "belum_mulai", label: "Akan Datang" },
    { kunci: "berakhir", label: "Selesai" },
    ];

    export default async function DaftarChallenge({ searchParams }) {
    const sp = await searchParams;
    const tabAktif = TAB.some((t) => t.kunci === sp.status) ? sp.status : "aktif";

    const semua = await ambilBanyak(
        `SELECT ch.id, ch.title, ch.tagline, ch.prize, ch.banner_url, ch.start_date, ch.end_date,
                u.display_name AS curator,
                (SELECT COUNT(*) FROM winners w WHERE w.challenge_id = ch.id) AS jumlah_pemenang,
                (SELECT STRING_AGG(c.name, '|' ORDER BY c.name) FROM challenge_categories cc
                JOIN categories c ON c.id = cc.category_id WHERE cc.challenge_id = ch.id) AS kategori
        FROM challenges ch JOIN users u ON u.id = ch.curator_id
        ORDER BY ch.start_date DESC`
    );
    const dengan = semua.map((c) => ({ ...c, status: hitungStatus(c.start_date, c.end_date) }));
    const jumlah = Object.fromEntries(TAB.map((t) => [t.kunci, dengan.filter((c) => c.status === t.kunci).length]));
    const daftar = dengan.filter((c) => c.status === tabAktif);

    return (
        <main className="max-w-7xl mx-auto px-6 py-10 w-full">
        <div className="mb-8 space-y-3">
            <h1 className="font-headline text-headline-lg text-light-on-surface">Art Challenge Kurasi</h1>
            <p className="text-body-md text-light-on-surface-variant max-w-2xl">
            Kompetisi bertema yang dikurasi oleh yayasan budaya, merek komunitas, dan juri museum.
            </p>
            <div className="flex items-center gap-2 pt-4 border-b border-light-outline-variant overflow-x-auto scrollbar-none">
            {TAB.map((t) => (
                <Link
                key={t.kunci}
                href={t.kunci === "aktif" ? "/challenges" : "/challenges?status=" + t.kunci}
                className={
                    t.kunci === tabAktif
                    ? "px-4 py-2.5 border-b-2 border-light-primary font-medium text-light-primary text-body-sm whitespace-nowrap"
                    : "px-4 py-2.5 text-light-on-surface-variant hover:text-light-on-surface text-body-sm font-medium whitespace-nowrap"
                }
                >
                {t.label} ({jumlah[t.kunci]})
                </Link>
            ))}
            </div>
        </div>

        {daftar.length === 0 ? (
            <KeadaanKosong ikon={Flag} judul="Belum ada challenge" deskripsi="Tidak ada challenge pada kategori status ini." />
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {daftar.map((c) => {
                const kategori = c.kategori ? c.kategori.split("|") : [];
                return (
                <article key={c.id} className="bg-light-surface rounded-xl border border-light-outline-variant overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                    <div>
                    <div className="aspect-[16/9] bg-warm-cream relative overflow-hidden">
                        <GambarKarya src={c.banner_url || "/images/placeholder-banner.svg"} alt={c.title} className={"w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 " + (c.status === "belum_mulai" ? "opacity-90" : "")} />
                        {c.status === "aktif" && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-success border border-emerald-200">Challenge Aktif</span>
                        )}
                        {c.status === "belum_mulai" && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-info border border-sky-200">Akan Datang</span>
                        )}
                        {c.status === "berakhir" && (
                        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" /> {c.jumlah_pemenang > 0 ? "Pemenang Diumumkan" : "Selesai"}
                        </span>
                        )}
                        {c.status === "aktif" && (
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                            {sisaHari(c.end_date) === 0 ? "Berakhir hari ini" : "Berakhir dalam " + sisaHari(c.end_date) + " hari"}
                        </span>
                        )}
                        {c.status === "belum_mulai" && (
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/60 text-white text-xs font-medium backdrop-blur-sm">
                            Dimulai {formatTanggal(c.start_date)}
                        </span>
                        )}
                    </div>
                    <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between gap-3 text-xs text-light-on-surface-variant">
                        <span className="truncate">Penyelenggara: <strong>{c.curator}</strong></span>
                        {c.status === "berakhir" ? (
                            <span className="font-medium whitespace-nowrap">Telah berakhir</span>
                        ) : (
                            c.prize && <span className="text-terracotta font-bold text-sm text-right">{c.prize}</span>
                        )}
                        </div>
                        <h3 className="font-headline text-title-lg font-bold text-light-on-surface">
                        <Link href={"/challenges/" + c.id} className="hover:text-light-primary">{c.title}</Link>
                        </h3>
                        {c.tagline && <p className="text-body-sm text-light-on-surface-variant line-clamp-2">{c.tagline}</p>}
                        {c.status === "berakhir" && c.jumlah_pemenang > 0 ? (
                        <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold pt-1">
                            <Trophy className="w-3.5 h-3.5" />
                            <span>{c.jumlah_pemenang} Pemenang Dianugerahi</span>
                        </div>
                        ) : (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            {kategori.length === 0 ? (
                            <span className="px-2 py-0.5 rounded text-[11px] bg-warm-cream text-light-on-surface">Semua Kategori Diizinkan</span>
                            ) : (
                            kategori.map((k) => <span key={k} className="px-2 py-0.5 rounded text-[11px] bg-warm-cream text-light-on-surface">{k}</span>)
                            )}
                        </div>
                        )}
                    </div>
                    </div>
                    <div className="p-5 pt-0">
                    <Link
                        href={"/challenges/" + c.id}
                        className={
                        c.status === "aktif"
                            ? "w-full py-2.5 px-4 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 text-body-sm shadow-sm"
                            : "w-full py-2.5 px-4 rounded-DEFAULT bg-warm-cream border border-light-outline text-light-on-surface font-medium hover:bg-sand/30 transition-colors flex items-center justify-center gap-2 text-body-sm"
                        }
                    >
                        <span>{c.status === "aktif" ? "Lihat Challenge & Submisi" : c.status === "belum_mulai" ? "Baca Ketentuan Challenge" : "Lihat Para Pemenang"}</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    </div>
                </article>
                );
            })}
            </div>
        )}
        </main>
    );
    }
