    import Link from "next/link";
    import { Compass, XCircle, Trophy, Send } from "lucide-react";
    import { wajibPeran } from "@/lib/auth";
    import { ambilBanyak } from "@/lib/query";
    import { formatTanggalPendek } from "@/lib/format";
    import { hitungStatus, sisaHari } from "@/lib/challenge";
    import GambarKarya from "@/components/ui/GambarKarya";
    import Pemberitahuan from "@/components/ui/Pemberitahuan";
    import KeadaanKosong from "@/components/ui/KeadaanKosong";
    import TombolKonfirmasi from "@/components/ui/TombolKonfirmasi";
    import { tarikSubmisi } from "./actions";

    export const metadata = { title: "Submisi Saya" };
    export const dynamic = "force-dynamic";

    export default async function HalamanSubmisiSaya({ searchParams }) {
    const pengguna = await wajibPeran(["member"]);
    const { galat, sukses } = await searchParams;

    const submisi = await ambilBanyak(
        `SELECT s.id, s.created_at, a.id AS artwork_id, a.title AS judul_karya, a.file_url,
                ch.id AS challenge_id, ch.title AS judul_challenge, ch.start_date, ch.end_date,
                cu.display_name AS curator, w.rank
        FROM submissions s
        JOIN artworks a ON a.id = s.artwork_id
        JOIN challenges ch ON ch.id = s.challenge_id
        JOIN users cu ON cu.id = ch.curator_id
        LEFT JOIN winners w ON w.submission_id = s.id
        WHERE s.user_id = $1
        ORDER BY s.created_at DESC`,
        [pengguna.id]
    );

    return (
        <div className="max-w-7xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-light-outline-variant">
            <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface">Submisi Challenge Saya</h1>
            <p className="text-body-md text-light-on-surface-variant">
                Pantau karya yang Anda ikutkan ke challenge. Submisi dapat ditarik sebelum challenge berakhir.
            </p>
            </div>
            <Link
            href="/challenges"
            className="px-5 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-[#6e3522] transition-colors text-body-sm shadow-sm flex items-center gap-2"
            >
            <Compass className="w-4 h-4" />
            <span>Lihat Challenge Terbuka</span>
            </Link>
        </div>

        <Pemberitahuan galat={galat} sukses={sukses} />

        {submisi.length === 0 ? (
            <KeadaanKosong
            ikon={Send}
            judul="Belum ada submisi"
            deskripsi="Ikuti challenge yang sedang aktif dan ikutkan karya terbaik Anda."
            tombol={{ teks: "Lihat Challenge", href: "/challenges" }}
            />
        ) : (
            <div className="space-y-6">
            {submisi.map((item) => {
                const status = hitungStatus(item.start_date, item.end_date);
                const menang = Boolean(item.rank);
                const sisa = sisaHari(item.end_date);
                return (
                <div
                    key={item.id}
                    className={
                    "bg-light-surface rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 " +
                    (menang ? "border-2 border-amber-300" : "border border-light-outline-variant")
                    }
                >
                    <div className="flex items-center gap-5">
                    <GambarKarya
                        src={item.file_url}
                        alt={item.judul_karya}
                        className={"w-24 h-24 rounded-lg object-cover border " + (menang ? "border-amber-300" : "border-sand")}
                    />
                    <div className="space-y-1">
                        {menang ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5 text-amber-700" /> Meraih Juara {item.rank}
                        </span>
                        ) : status === "berakhir" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warm-cream text-light-on-surface-variant border border-light-outline">
                            Challenge Selesai
                        </span>
                        ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-success border border-emerald-200">
                            Dalam Penilaian — Aktif
                        </span>
                        )}
                        <h3 className="font-headline text-title-lg font-bold text-light-on-surface">{item.judul_karya}</h3>
                        <p className="text-body-sm text-light-on-surface-variant">
                        Diikutkan ke: <strong>{item.judul_challenge}</strong> ({item.curator})
                        </p>
                        <span className="text-xs text-light-on-surface-variant block">
                        {status === "berakhir"
                            ? "Challenge berakhir " + formatTanggalPendek(item.end_date)
                            : "Diikutkan pada " + formatTanggalPendek(item.created_at) + " • Batas waktu " + (sisa <= 0 ? "hari ini" : sisa + " hari lagi")}
                        </span>
                    </div>
                    </div>
                    <div className="flex items-center gap-3">
                    {menang ? (
                        <Link
                        href={"/challenges/" + item.challenge_id}
                        className="px-4 py-2 rounded bg-amber-50 text-amber-900 border border-amber-200 text-body-sm font-medium hover:bg-amber-100"
                        >
                        Lihat Pameran Pemenang
                        </Link>
                    ) : (
                        <>
                        <Link
                            href={"/artworks/" + item.artwork_id}
                            className="px-4 py-2 rounded border border-light-outline text-body-sm font-medium hover:bg-warm-cream"
                        >
                            Lihat Karya
                        </Link>
                        {status !== "berakhir" && (
                            <TombolKonfirmasi
                            aksi={tarikSubmisi}
                            nilai={{ id: item.id }}
                            pesan="Tarik karya ini dari challenge? Anda dapat mengikutkan karya lain selama challenge masih aktif."
                            className="px-4 py-2 rounded bg-rose-50 text-danger border border-rose-200 text-body-sm font-medium hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                            >
                            <XCircle className="w-4 h-4" />
                            <span>Tarik Submisi</span>
                            </TombolKonfirmasi>
                        )}
                        </>
                    )}
                    </div>
                </div>
                );
            })}
            </div>
        )}
        </div>
    );
    }
