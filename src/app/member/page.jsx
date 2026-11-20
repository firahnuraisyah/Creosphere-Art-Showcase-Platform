    import Link from "next/link";
    import { Plus, Image as IkonGambar, Heart, Trophy, Bookmark, ArrowUpRight } from "lucide-react";
    import { wajibPeran } from "@/lib/auth";
    import { ambilBanyak, ambilSatu } from "@/lib/query";
    import { formatAngka, formatTanggalPendek, inisial, waktuRelatif } from "@/lib/format";
    import GambarKarya from "@/components/ui/GambarKarya";

    export const metadata = { title: "Dashboard Member" };
    export const dynamic = "force-dynamic";

    export default async function HalamanDashboardMember() {
    const pengguna = await wajibPeran(["member"]);

    const totalKarya = await ambilSatu("SELECT COUNT(*) AS jumlah FROM artworks WHERE user_id = $1", [pengguna.id]);
    const karyaBulanIni = await ambilSatu(
        "SELECT COUNT(*) AS jumlah FROM artworks WHERE user_id = $1 AND created_at >= date_trunc('month', NOW())",
        [pengguna.id]
    );
    const totalLike = await ambilSatu(
        "SELECT COUNT(*) AS jumlah FROM likes l JOIN artworks a ON a.id = l.artwork_id WHERE a.user_id = $1",
        [pengguna.id]
    );
    const submisiAktif = await ambilBanyak(
        `SELECT ch.title FROM submissions s
        JOIN challenges ch ON ch.id = s.challenge_id
        WHERE s.user_id = $1 AND CURRENT_DATE <= ch.end_date
        ORDER BY ch.end_date ASC`,
        [pengguna.id]
    );
    const totalFavorit = await ambilSatu("SELECT COUNT(*) AS jumlah FROM favorites WHERE user_id = $1", [pengguna.id]);

    const karyaTerbaru = await ambilBanyak(
        `SELECT a.id, a.title, a.file_url, a.created_at, c.name AS kategori,
                (SELECT COUNT(*) FROM likes l WHERE l.artwork_id = a.id) AS jumlah_like
        FROM artworks a JOIN categories c ON c.id = a.category_id
        WHERE a.user_id = $1 ORDER BY a.created_at DESC LIMIT 2`,
        [pengguna.id]
    );

    const komentar = await ambilBanyak(
        `SELECT c.body, c.created_at, u.display_name, a.id AS artwork_id, a.title
        FROM comments c
        JOIN artworks a ON a.id = c.artwork_id
        JOIN users u ON u.id = c.user_id
        WHERE a.user_id = $1 AND c.user_id <> $1
        ORDER BY c.created_at DESC LIMIT 5`,
        [pengguna.id]
    );
    const penghargaan = await ambilBanyak(
        `SELECT w.rank, w.created_at, a.title, ch.title AS challenge
        FROM winners w
        JOIN submissions s ON s.id = w.submission_id
        JOIN artworks a ON a.id = s.artwork_id
        JOIN challenges ch ON ch.id = w.challenge_id
        WHERE s.user_id = $1
        ORDER BY w.created_at DESC LIMIT 5`,
        [pengguna.id]
    );

    const aktivitas = [
        ...komentar.map((k) => ({ jenis: "komentar", waktu: k.created_at, data: k })),
        ...penghargaan.map((p) => ({ jenis: "penghargaan", waktu: p.created_at, data: p })),
    ]
        .sort((a, b) => new Date(b.waktu) - new Date(a.waktu))
        .slice(0, 5);

    const jumlahKarya = totalKarya?.jumlah ?? 0;

    return (
        <div className="max-w-7xl space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-light-outline-variant">
            <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface">Selamat datang, {pengguna.display_name}</h1>
            <p className="text-body-md text-light-on-surface-variant">
                Pantau apresiasi karya, submisi ke challenge yang terbuka, dan interaksi komunitas.
            </p>
            </div>
            <div className="flex items-center gap-3">
            <Link
                href="/member/artworks/new"
                className="px-5 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary text-label-lg font-medium hover:bg-[#6e3522] transition-colors shadow-sm flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                <span>Unggah Karya Baru</span>
            </Link>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-medium block mb-1">Total Karya</span>
            <div className="flex items-baseline justify-between">
                <span className="font-headline text-3xl font-bold text-light-on-surface">{formatAngka(jumlahKarya)}</span>
                <IkonGambar className="w-5 h-5 text-light-primary" />
            </div>
            <span className="text-xs text-success flex items-center gap-1 mt-2">
                <ArrowUpRight className="w-3 h-3" /> +{formatAngka(karyaBulanIni?.jumlah ?? 0)} bulan ini
            </span>
            </div>
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-medium block mb-1">Total Apresiasi</span>
            <div className="flex items-baseline justify-between">
                <span className="font-headline text-3xl font-bold text-terracotta">{formatAngka(totalLike?.jumlah ?? 0)}</span>
                <Heart className="w-5 h-5 text-terracotta" />
            </div>
            <span className="text-xs text-light-on-surface-variant mt-2 block">Dari seluruh {formatAngka(jumlahKarya)} karya yang terbit</span>
            </div>
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-medium block mb-1">Submisi Aktif</span>
            <div className="flex items-baseline justify-between">
                <span className="font-headline text-3xl font-bold text-olive">{formatAngka(submisiAktif.length)}</span>
                <Trophy className="w-5 h-5 text-olive" />
            </div>
            <span className="text-xs text-olive font-medium mt-2 block">
                {submisiAktif.length > 0 ? "Sedang dinilai (\"" + submisiAktif[0].title + "\")" : "Belum ada submisi aktif"}
            </span>
            </div>
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-medium block mb-1">Favorit Tersimpan</span>
            <div className="flex items-baseline justify-between">
                <span className="font-headline text-3xl font-bold text-light-on-surface">{formatAngka(totalFavorit?.jumlah ?? 0)}</span>
                <Bookmark className="w-5 h-5 text-sand" />
            </div>
            <span className="text-xs text-light-on-surface-variant mt-2 block">Karya komunitas yang Anda simpan</span>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between">
            <h2 className="font-headline text-headline-md text-light-on-surface">Karya Terbaru di Portofolio</h2>
            <Link href="/member/artworks" className="text-body-sm font-medium text-light-primary hover:underline">
                Lihat semua {formatAngka(jumlahKarya)} karya
            </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {karyaTerbaru.map((karya) => (
                <div key={karya.id} className="bg-light-surface rounded-lg border border-light-outline-variant p-4 shadow-sm flex items-center gap-4">
                <GambarKarya src={karya.file_url} alt={karya.title} className="w-20 h-20 rounded object-cover" />
                <div className="truncate flex-1">
                    <span className="text-xs font-semibold text-terracotta">{karya.kategori}</span>
                    <h3 className="font-headline text-title-md font-bold text-light-on-surface truncate">{karya.title}</h3>
                    <span className="text-xs text-light-on-surface-variant block">Terbit {formatTanggalPendek(karya.created_at)}</span>
                    <div className="flex items-center gap-3 pt-2 text-xs text-light-on-surface-variant">
                    <span className="flex items-center gap-1 text-terracotta">
                        <Heart className="w-3.5 h-3.5" /> {formatAngka(karya.jumlah_like)}
                    </span>
                    <Link href={"/member/artworks/" + karya.id + "/edit"} className="text-light-primary hover:underline">
                        Edit
                    </Link>
                    </div>
                </div>
                </div>
            ))}
            <Link
                href="/member/artworks/new"
                className="border-2 border-dashed border-light-outline rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-light-primary hover:bg-warm-cream transition-colors group"
            >
                <div className="w-10 h-10 rounded-full bg-light-surface border border-light-outline flex items-center justify-center text-light-primary mb-2 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
                </div>
                <span className="font-headline text-title-md font-bold text-light-on-surface">Terbitkan Karya Baru</span>
                <span className="text-xs text-light-on-surface-variant mt-1">Unggah JPG, PNG, WebP, atau GIF hingga 5 MB</span>
            </Link>
            </div>
        </div>

        <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 space-y-4">
            <h2 className="font-headline text-title-lg font-bold text-light-on-surface">Interaksi Komunitas Terbaru</h2>
            {aktivitas.length === 0 ? (
            <p className="text-body-sm text-light-on-surface-variant py-4">
                Belum ada interaksi. Komentar dan penghargaan untuk karya Anda akan muncul di sini.
            </p>
            ) : (
            <div className="divide-y divide-light-outline-variant">
                {aktivitas.map((item, i) =>
                item.jenis === "komentar" ? (
                    <div key={"k" + i} className="py-3 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-light-primary-container text-light-on-primary-container flex items-center justify-center font-bold text-xs shrink-0">
                        {inisial(item.data.display_name)}
                        </div>
                        <div>
                        <p className="text-body-sm text-light-on-surface">
                            <strong>{item.data.display_name}</strong> berkomentar pada karya Anda{" "}
                            <Link href={"/artworks/" + item.data.artwork_id} className="text-light-primary font-medium hover:underline">
                            {item.data.title}
                            </Link>
                            : <em>&quot;{item.data.body.length > 80 ? item.data.body.slice(0, 80) + "..." : item.data.body}&quot;</em>
                        </p>
                        <span className="text-xs text-light-on-surface-variant">{waktuRelatif(item.waktu)}</span>
                        </div>
                    </div>
                    </div>
                ) : (
                    <div key={"p" + i} className="py-3 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-success flex items-center justify-center font-bold text-xs shrink-0">
                        <Trophy className="w-4 h-4" />
                        </div>
                        <div>
                        <p className="text-body-sm text-light-on-surface">
                            Karya Anda <strong>{item.data.title}</strong> meraih <strong>Juara {item.data.rank}</strong> di challenge{" "}
                            <em>{item.data.challenge}</em>!
                        </p>
                        <span className="text-xs text-light-on-surface-variant">{waktuRelatif(item.waktu)}</span>
                        </div>
                    </div>
                    </div>
                )
                )}
            </div>
            )}
        </div>
        </div>
    );
    }
