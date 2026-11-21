    import Link from "next/link";
    import { Plus, FolderKanban, Clock, Images, Award, Eye } from "lucide-react";
    import { wajibPeran } from "@/lib/auth";
    import { ambilBanyak } from "@/lib/query";
    import { hitungStatus } from "@/lib/challenge";
    import { formatTanggal, formatTanggalPendek, formatAngka } from "@/lib/format";
    import GambarKarya from "@/components/ui/GambarKarya";
    import KeadaanKosong from "@/components/ui/KeadaanKosong";

    export const metadata = { title: "Dashboard Curator" };
    export const dynamic = "force-dynamic";

    export default async function DashboardCurator() {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });

    const challenge = await ambilBanyak(
        `SELECT c.id, c.title, c.start_date, c.end_date,
                (SELECT COUNT(*) FROM submissions s WHERE s.challenge_id = c.id) AS jumlah_submisi
        FROM challenges c WHERE c.curator_id = $1 ORDER BY c.start_date DESC`,
        [pengguna.id]
    );
    const terbaru = await ambilBanyak(
        `SELECT s.id, s.created_at, a.title, a.file_url, u.display_name AS seniman
        FROM submissions s
        JOIN challenges c ON c.id = s.challenge_id
        JOIN artworks a ON a.id = s.artwork_id
        JOIN users u ON u.id = s.user_id
        WHERE c.curator_id = $1
        ORDER BY s.created_at DESC LIMIT 4`,
        [pengguna.id]
    );

    const dengan = challenge.map((c) => ({ ...c, status: hitungStatus(c.start_date, c.end_date) }));
    const aktif = dengan.filter((c) => c.status === "aktif");
    const selesai = dengan.filter((c) => c.status === "berakhir");
    const totalSubmisi = dengan.reduce((n, c) => n + c.jumlah_submisi, 0);
    const submisiAktif = aktif.reduce((n, c) => n + c.jumlah_submisi, 0);
    const sorotan = aktif[0];

    return (
        <div className="max-w-7xl space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-light-outline-variant">
            <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface">Ringkasan Curator</h1>
            <p className="text-body-md text-light-on-surface-variant">
                Kelola kompetisi yang Anda selenggarakan, tinjau submisi karya komunitas, dan tetapkan para pemenang.
            </p>
            </div>
            <Link href="/curator/challenges/new" className="px-5 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-[#6e3522] transition-colors text-body-sm shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Buat Challenge Baru</span>
            </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-medium block mb-1">Total Challenge</span>
            <div className="flex items-baseline justify-between">
                <span className="font-headline text-3xl font-bold text-light-on-surface">{formatAngka(dengan.length)}</span>
                <FolderKanban className="w-5 h-5 text-olive" />
            </div>
            <span className="text-xs text-light-on-surface-variant mt-2 block">Sejak bergabung di platform</span>
            </div>
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-medium block mb-1">Challenge Aktif</span>
            <div className="flex items-baseline justify-between">
                <span className="font-headline text-3xl font-bold text-success">{formatAngka(aktif.length)}</span>
                <Clock className="w-5 h-5 text-success" />
            </div>
            <span className="text-xs text-success mt-2 block truncate">{sorotan ? "“" + sorotan.title + "”" : "Belum ada yang berjalan"}</span>
            </div>
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-medium block mb-1">Total Submisi</span>
            <div className="flex items-baseline justify-between">
                <span className="font-headline text-3xl font-bold text-terracotta">{formatAngka(totalSubmisi)}</span>
                <Images className="w-5 h-5 text-terracotta" />
            </div>
            <span className="text-xs text-light-on-surface-variant mt-2 block">{formatAngka(submisiAktif)} pada challenge aktif</span>
            </div>
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-medium block mb-1">Challenge Selesai</span>
            <div className="flex items-baseline justify-between">
                <span className="font-headline text-3xl font-bold text-amber-700">{formatAngka(selesai.length)}</span>
                <Award className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-amber-700 mt-2 block">Sudah berakhir</span>
            </div>
        </div>

        {sorotan && (
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-success border border-emerald-200">
                    Challenge Sedang Berjalan
                </span>
                <h2 className="font-headline text-headline-md text-light-on-surface mt-2">{sorotan.title}</h2>
                <p className="text-body-sm text-light-on-surface-variant">
                    Tenggat: {formatTanggal(sorotan.end_date)} • {formatAngka(sorotan.jumlah_submisi)} karya member telah dikirim.
                </p>
                </div>
                <div className="flex items-center gap-3">
                <Link href={"/curator/challenges/" + sorotan.id + "/submissions"} className="px-4 py-2 rounded-DEFAULT bg-light-primary text-light-on-primary text-body-sm font-medium hover:bg-[#6e3522] transition-colors flex items-center gap-1.5 shadow-sm">
                    <Eye className="w-4 h-4" />
                    <span>Tinjau Submisi ({formatAngka(sorotan.jumlah_submisi)})</span>
                </Link>
                <Link href={"/curator/challenges/" + sorotan.id + "/edit"} className="px-4 py-2 rounded-DEFAULT bg-warm-cream border border-light-outline text-body-sm font-medium hover:bg-sand/30">
                    Ubah Detail
                </Link>
                </div>
            </div>
            </div>
        )}

        <div className="space-y-4">
            <div className="flex items-center justify-between">
            <h2 className="font-headline text-headline-md text-light-on-surface">Submisi Masuk Terbaru</h2>
            <Link href="/curator/challenges" className="text-body-sm font-medium text-light-primary hover:underline">
                Lihat semua challenge
            </Link>
            </div>
            {terbaru.length === 0 ? (
            <KeadaanKosong
                ikon={Images}
                judul="Belum ada submisi masuk"
                deskripsi="Submisi karya dari member akan muncul di sini setelah challenge Anda berjalan."
                tombol={dengan.length === 0 ? { teks: "Buat Challenge Pertama", href: "/curator/challenges/new" } : undefined}
            />
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {terbaru.map((s) => (
                <div key={s.id} className="bg-light-surface rounded-lg border border-light-outline-variant p-3 shadow-sm">
                    <GambarKarya src={s.file_url} alt={s.title} className="w-full aspect-[4/3] rounded object-cover mb-2" />
                    <h4 className="font-headline text-title-md font-bold text-light-on-surface truncate">{s.title}</h4>
                    <span className="text-xs text-light-on-surface-variant block">{s.seniman} • {formatTanggalPendek(s.created_at)}</span>
                </div>
                ))}
            </div>
            )}
        </div>
        </div>
    );
    }
