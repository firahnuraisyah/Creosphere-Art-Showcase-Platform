    import Link from "next/link";
    import { Home, LogIn } from "lucide-react";
    import HeaderAuth from "@/components/layout/HeaderAuth";
    import FooterAuth from "@/components/layout/FooterAuth";

    export const metadata = { title: "Akses Ditolak" };

    export default function Terlarang() {
    return (
        <div className="flex-1 flex flex-col justify-between">
        <HeaderAuth />
        <main className="w-full max-w-lg mx-auto px-6 py-8 text-center">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-10 shadow-sm">
            <p className="font-headline text-display text-terracotta mb-2">403</p>
            <h1 className="font-headline text-headline-md text-light-on-surface mb-2">Akses Ditolak</h1>
            <p className="text-body-sm text-light-on-surface-variant text-pretty mb-8">
                Anda tidak memiliki akses ke halaman ini.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/" className="px-6 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-[#6e3522] transition-colors shadow-sm inline-flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
                </Link>
                <Link href="/login" className="px-6 py-2.5 rounded-DEFAULT bg-light-surface text-light-on-surface border border-light-outline font-medium hover:bg-warm-cream transition-colors inline-flex items-center justify-center gap-2">
                <LogIn className="w-4 h-4 text-olive" />
                <span>Masuk dengan Akun Lain</span>
                </Link>
            </div>
            </div>
        </main>
        <FooterAuth />
        </div>
    );
    }
