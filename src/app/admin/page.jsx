import Link from "next/link";
import { User, Image as IkonGambar, AlertCircle, Trophy, UserCheck, ShieldAlert } from "lucide-react";
import { wajibPeran } from "@/lib/auth";
import { ambilSatu, ambilBanyak } from "@/lib/query";
import { hitungStatus } from "@/lib/challenge";
import { formatAngka, formatTanggal } from "@/lib/format";

export const metadata = { title: "Dashboard Admin" };
export const dynamic = "force-dynamic";

export default async function DashboardAdmin() {
    await wajibPeran(["admin"]);

    const angka =
        (await ambilSatu(
        `SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'member') AS member,
            (SELECT COUNT(*) FROM users WHERE role = 'curator' AND status = 'approved') AS curator_setuju,
            (SELECT COUNT(*) FROM users WHERE role = 'curator' AND status = 'pending') AS curator_pending,
            (SELECT COUNT(*) FROM users WHERE role = 'admin') AS admin,
            (SELECT COUNT(*) FROM artworks) AS karya,
            (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS laporan,
            (SELECT COUNT(DISTINCT artwork_id) FROM reports WHERE status = 'pending') AS karya_dilaporkan`
        )) || {};
    const jadwal = await ambilBanyak("SELECT start_date, end_date FROM challenges");
    const challengeAktif = jadwal.filter((c) => hitungStatus(c.start_date, c.end_date) === "aktif").length;

    const curatorPertama = await ambilSatu(
        "SELECT display_name, created_at FROM users WHERE role = 'curator' AND status = 'pending' ORDER BY created_at LIMIT 1"
    );
    const laporanPertama = await ambilSatu(
        `SELECT r.reason, r.artwork_id FROM reports r WHERE r.status = 'pending' ORDER BY r.created_at DESC LIMIT 1`
    );

    const nol = (n) => formatAngka(n || 0);

    return (
        <div className="max-w-7xl space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-light-outline-variant">
            <div>
            <h1 className="font-headline text-headline-lg text-light-on-surface">Administrasi Platform</h1>
            <p className="text-body-md text-light-on-surface-variant">
                Kondisi sistem, jumlah data, permintaan verifikasi, dan antrean moderasi konten.
            </p>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-medium block mb-1">Member Terdaftar</span>
            <div className="flex items-baseline justify-between">
                <span className="font-headline text-3xl font-bold text-light-on-surface">{nol(angka.member)}</span>
                <User className="w-5 h-5 text-light-primary" />
            </div>
            <span className="text-xs text-light-on-surface-variant mt-2 block">Langsung aktif saat mendaftar • {nol(angka.admin)} admin</span>
            </div>

            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-medium block mb-1">Curator (Disetujui / Menunggu)</span>
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className="font-headline text-3xl font-bold text-olive">{nol(angka.curator_setuju)}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-warning border border-amber-200 text-xs font-bold">{nol(angka.curator_pending)} Menunggu</span>
            </div>
            <Link href="/admin/curators" className="text-xs text-light-primary font-medium hover:underline mt-2 block">
                Tinjau {nol(angka.curator_pending)} persetujuan →
            </Link>
            </div>

            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-medium block mb-1">Total Karya Terbit</span>
            <div className="flex items-baseline justify-between">
                <span className="font-headline text-3xl font-bold text-light-on-surface">{nol(angka.karya)}</span>
                <IkonGambar className="w-5 h-5 text-terracotta" />
            </div>
            <Link href="/admin/moderation" className="text-xs text-danger font-medium hover:underline mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{nol(angka.laporan)} laporan menunggu di antrean</span>
            </Link>
            </div>

            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm">
            <span className="text-xs uppercase tracking-wider text-light-on-surface-variant font-medium block mb-1">Challenge Aktif</span>
            <div className="flex items-baseline justify-between">
                <span className="font-headline text-3xl font-bold text-success">{formatAngka(challengeAktif)}</span>
                <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xs text-light-on-surface-variant mt-2 block">Dihitung dari tanggal server</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-headline text-title-lg font-bold text-light-on-surface flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-warning" />
                <span>Antrean Verifikasi Curator</span>
                </h2>
                <span className="text-xs text-warning font-semibold">{nol(angka.curator_pending)} Permintaan Menunggu</span>
            </div>
            <p className="text-body-sm text-light-on-surface-variant">
                Organisasi dan kolektif budaya independen yang menunggu tinjauan admin sebelum membuat challenge.
            </p>
            {curatorPertama ? (
                <div className="p-3 bg-warm-cream rounded-lg border border-sand flex flex-wrap items-center justify-between gap-3 text-body-sm">
                <div>
                    <strong>{curatorPertama.display_name}</strong>
                    <span className="text-xs text-light-on-surface-variant block">Mendaftar {formatTanggal(curatorPertama.created_at)}</span>
                </div>
                <Link href="/admin/curators" className="px-3 py-1.5 rounded bg-light-surface border border-light-outline text-xs font-medium hover:bg-sand/30">
                    Tinjau Detail
                </Link>
                </div>
            ) : (
                <p className="p-3 bg-warm-cream rounded-lg border border-sand text-body-sm text-light-on-surface-variant">Tidak ada permintaan yang menunggu.</p>
            )}
            </div>

            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-headline text-title-lg font-bold text-light-on-surface flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-danger" />
                <span>Antrean Moderasi Karya</span>
                </h2>
                <span className="text-xs text-danger font-semibold">{nol(angka.karya_dilaporkan)} Karya Dilaporkan</span>
            </div>
            <p className="text-body-sm text-light-on-surface-variant">
                Laporan member yang perlu ditinjau. Abaikan laporan atau jalankan Take Down yang menghapus seluruh data terkait.
            </p>
            {laporanPertama ? (
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 flex flex-wrap items-center justify-between gap-3 text-body-sm">
                <div>
                    <strong className="text-danger">{laporanPertama.reason}</strong>
                    <span className="text-xs text-light-on-surface-variant block">Dilaporkan pada karya #{laporanPertama.artwork_id}</span>
                </div>
                <Link href="/admin/moderation" className="px-3 py-1.5 rounded bg-white border border-rose-300 text-danger text-xs font-semibold hover:bg-rose-100">
                    Tindak Lanjut
                </Link>
                </div>
            ) : (
                <p className="p-3 bg-warm-cream rounded-lg border border-sand text-body-sm text-light-on-surface-variant">Antrean moderasi kosong.</p>
            )}
            </div>
        </div>
        </div>
    );
}
