    import Link from "next/link";
    import { redirect } from "next/navigation";
    import { Hourglass, CheckCircle2, Loader, Circle, Info, Compass, RefreshCw, XCircle, Trash2, LogOut } from "lucide-react";
    import HeaderAuth from "@/components/layout/HeaderAuth";
    import FooterAuth from "@/components/layout/FooterAuth";
    import Pemberitahuan from "@/components/ui/Pemberitahuan";
    import TombolKonfirmasi from "@/components/ui/TombolKonfirmasi";
    import { ambilPengguna, tujuanDashboard } from "@/lib/auth";
    import { ambilSatu } from "@/lib/query";
    import { formatTanggal } from "@/lib/format";
    import { hapusAkunDitolak } from "./actions";

    export const metadata = { title: "Status Akun Curator" };
    export const dynamic = "force-dynamic";

    export default async function HalamanPendingCurator({ searchParams }) {
    const pengguna = await ambilPengguna();
    if (!pengguna) redirect("/login");
    if (pengguna.role !== "curator") redirect(tujuanDashboard(pengguna.role, pengguna.status));
    if (pengguna.status === "approved") redirect("/curator");

    const { galat } = await searchParams;
    const detail = await ambilSatu("SELECT created_at FROM users WHERE id = $1", [pengguna.id]);
    const ditolak = pengguna.status === "rejected";

    const keluar = (
        <form action="/api/logout" method="POST">
        <button type="submit" className="text-body-sm text-light-primary font-medium hover:underline flex items-center gap-1">
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
        </button>
        </form>
    );

    return (
        <div className="min-h-screen flex flex-col justify-between">
        <HeaderAuth kanan={keluar} />
        <main className="w-full max-w-lg mx-auto px-6 py-8 space-y-4">
            <Pemberitahuan galat={galat} />

            {ditolak ? (
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-8 shadow-sm text-center">
                <div className="w-14 h-14 rounded-full bg-rose-50 text-danger border border-rose-200 flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-danger border border-rose-200 text-label-sm font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-danger"></span> Tidak Disetujui
                </span>
                <h1 className="font-headline text-headline-md text-light-on-surface mb-2">Pendaftaran Curator Anda Tidak Disetujui</h1>
                <p className="text-body-sm text-light-on-surface-variant text-pretty mb-6">
                Setelah ditinjau, administrator tidak dapat menyetujui akun curator ini. Akses ke Dashboard Curator tetap tidak tersedia.
                </p>
                <div className="text-left p-4 bg-warm-cream rounded-md border border-light-outline space-y-1.5 mb-6">
                <p className="text-label-lg text-light-on-surface">Pilihan Anda</p>
                <p className="text-body-sm text-light-on-surface-variant">
                    Anda dapat menghapus akun ini lalu mendaftar kembali dengan detail organisasi yang diperbarui.
                </p>
                </div>
                <div className="space-y-3">
                <TombolKonfirmasi
                    aksi={hapusAkunDitolak}
                    pesan="Hapus akun ini secara permanen? Tindakan ini tidak dapat dibatalkan."
                    className="w-full py-2.5 px-4 rounded-DEFAULT bg-danger text-on-danger font-medium hover:bg-red-700 transition-colors duration-state-change flex items-center justify-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus Akun Saya</span>
                </TombolKonfirmasi>
                <Link href="/" className="w-full py-2.5 px-4 rounded-DEFAULT bg-light-surface text-light-on-surface border border-light-outline font-medium hover:bg-warm-cream transition-colors flex items-center justify-center gap-2">
                    <Compass className="w-4 h-4 text-olive" />
                    <span>Jelajahi Galeri</span>
                </Link>
                </div>
            </div>
            ) : (
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-8 shadow-sm text-center">
                <div className="w-14 h-14 rounded-full bg-light-secondary-container text-light-on-secondary-container flex items-center justify-center mx-auto mb-5">
                <Hourglass className="w-7 h-7 text-olive" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-label-sm font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-warning"></span> Menunggu Verifikasi
                </span>
                <h1 className="font-headline text-headline-md text-light-on-surface mb-2">Akun Curator Anda Sedang Ditinjau</h1>
                <p className="text-body-sm text-light-on-surface-variant text-pretty mb-6">
                Terima kasih telah mendaftar, {pengguna.display_name}. Administrator sedang memverifikasi organisasi Anda. Setelah disetujui, Anda dapat membuat challenge dan memilih pemenang.
                </p>
                <div className="text-left p-4 bg-warm-cream rounded-md border border-light-outline space-y-3 mb-6">
                <p className="text-label-lg text-light-on-surface">Langkah selanjutnya</p>
                <p className="flex items-start gap-2.5 text-body-sm text-light-on-surface-variant"><CheckCircle2 className="w-4 h-4 text-success mt-0.5" /><span>Pendaftaran diterima — <strong>{formatTanggal(detail && detail.created_at)}</strong></span></p>
                <p className="flex items-start gap-2.5 text-body-sm text-light-on-surface-variant"><Loader className="w-4 h-4 text-warning mt-0.5" /><span>Peninjauan oleh administrator sedang berlangsung</span></p>
                <p className="flex items-start gap-2.5 text-body-sm text-light-on-surface-variant"><Circle className="w-4 h-4 text-light-outline mt-0.5" /><span>Akses ke Dashboard Curator setelah disetujui</span></p>
                </div>
                <p className="text-body-sm text-light-on-surface-variant mb-6 flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-info" />
                <span>Halaman dashboard tetap terkunci sampai status Anda menjadi Disetujui.</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/" className="flex-1 py-2.5 px-4 rounded-DEFAULT bg-light-surface text-light-on-surface border border-light-outline font-medium hover:bg-warm-cream transition-colors flex items-center justify-center gap-2">
                    <Compass className="w-4 h-4 text-olive" />
                    <span>Jelajahi Galeri</span>
                </Link>
                <Link href="/curator/pending" className="flex-1 py-2.5 px-4 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-[#6e3522] active:bg-[#58291a] transition-colors duration-state-change shadow-sm flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Periksa Status</span>
                </Link>
                </div>
            </div>
            )}
        </main>
        <FooterAuth />
        </div>
    );
    }
