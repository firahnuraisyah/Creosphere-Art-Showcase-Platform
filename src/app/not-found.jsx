    import Link from "next/link";
    import { Home, Search } from "lucide-react";
    import HeaderAuth from "@/components/layout/HeaderAuth";
    import FooterAuth from "@/components/layout/FooterAuth";

    export const metadata = { title: "Halaman Tidak Ditemukan" };

    export default function TidakDitemukan() {
    return (
        <div className="flex-1 flex flex-col justify-between">
        <HeaderAuth
            kanan={
            <Link href="/artworks" className="text-body-sm text-light-primary font-medium hover:underline">
                Jelajahi Karya
            </Link>
            }
        />
        <main className="w-full max-w-lg mx-auto px-6 py-8 text-center">
            <div className="bg-light-surface rounded-xl border border-light-outline-variant p-10 shadow-sm">
            <p className="font-headline text-display text-terracotta mb-2">404</p>
            <h1 className="font-headline text-headline-md text-light-on-surface mb-2">Halaman Ini Tidak Ada di Pameran</h1>
            <p className="text-body-sm text-light-on-surface-variant text-pretty mb-8">
                Karya, seniman, atau halaman yang Anda cari mungkin sudah dipindahkan, diturunkan, atau tidak pernah ada.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/" className="px-6 py-2.5 rounded-DEFAULT bg-light-primary text-light-on-primary font-medium hover:bg-[#6e3522] transition-colors shadow-sm inline-flex items-center justify-center gap-2">
                <Home className="w-4 h-4" />
                <span>Kembali ke Beranda</span>
                </Link>
                <Link href="/artworks" className="px-6 py-2.5 rounded-DEFAULT bg-light-surface text-light-on-surface border border-light-outline font-medium hover:bg-warm-cream transition-colors inline-flex items-center justify-center gap-2">
                <Search className="w-4 h-4 text-olive" />
                <span>Jelajahi Karya</span>
                </Link>
            </div>
            </div>
        </main>
        <FooterAuth />
        </div>
    );
    }
