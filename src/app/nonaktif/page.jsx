import Link from "next/link";
import { redirect } from "next/navigation";
import { Ban, Compass, LogOut, Info } from "lucide-react";
import HeaderAuth from "@/components/layout/HeaderAuth";
import FooterAuth from "@/components/layout/FooterAuth";
import { ambilPengguna, tujuanDashboard } from "@/lib/auth";

export const metadata = { title: "Akun Dinonaktifkan" };
export const dynamic = "force-dynamic";

export default async function HalamanAkunNonaktif() {
    const pengguna = await ambilPengguna();
    if (!pengguna) redirect("/login");
    if (pengguna.is_active) redirect(tujuanDashboard(pengguna.role, pengguna.status, true));

    const keluar = (
        <form action="/api/logout" method="POST">
        <button type="submit" className="text-body-sm text-primary font-medium hover:underline flex items-center gap-1">
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
        </button>
        </form>
    );

    return (
        <div className="min-h-screen flex flex-col justify-between">
        <HeaderAuth kanan={keluar} />
        <main className="w-full max-w-lg mx-auto px-6 py-8">
            <div className="bg-surface rounded-xl border border-outline-variant p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-danger border border-rose-200 flex items-center justify-center mx-auto mb-5">
                <Ban className="w-7 h-7" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-danger border border-rose-200 text-label-sm font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-danger"></span> Akun Nonaktif
            </span>
            <h1 className="font-headline text-headline-md text-on-surface mb-2">Akun Anda Telah Dinonaktifkan</h1>
            <p className="text-body-sm text-on-surface-variant text-pretty mb-6">
                Halo {pengguna.display_name}, akun Anda dinonaktifkan oleh administrator Creosphere. Selama akun nonaktif,
                Anda tidak dapat mengakses dashboard, mengunggah karya, atau berinteraksi dengan karya lain.
            </p>
            <div className="text-left p-4 bg-surface-container-low rounded-md border border-outline-variant space-y-1.5 mb-6">
                <p className="text-label-lg text-on-surface">Apa yang terjadi pada karya saya?</p>
                <p className="text-body-sm text-on-surface-variant">
                Karya Anda tetap tampil di galeri dengan tanda &ldquo;Akun nonaktif&rdquo;. Seluruh data Anda tidak dihapus.
                </p>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-6 flex items-center justify-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-info" />
                <span>Hubungi administrator bila Anda merasa ini sebuah kekeliruan.</span>
            </p>
            <Link href="/" className="w-full py-2.5 px-4 rounded bg-surface text-on-surface border border-border-input font-medium hover:bg-surface-container transition-colors flex items-center justify-center gap-2">
                <Compass className="w-4 h-4" />
                <span>Jelajahi Galeri</span>
            </Link>
            </div>
        </main>
        <FooterAuth />
        </div>
    );
}
