import Link from "next/link";
import Logo from "@/components/layout/Logo";

// Footer halaman publik
export default function FooterPublik() {
    const tautan = "font-body text-body-sm text-on-surface-variant hover:text-on-surface transition-colors duration-state-change";
    return (
        <footer className="bg-surface-container-low border-t border-outline-variant py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Logo ukuran="text-title-md" />
            <p className="font-body text-body-sm text-outline text-center">
            Ruang global bagi seniman untuk berbagi, memamerkan, dan mengapresiasi kreativitas.
            </p>
            <div className="flex items-center gap-5">
            <Link href="/artworks" className={tautan}>Kategori</Link>
            <Link href="/challenges" className={tautan}>Challenge</Link>
            <Link href="/register" className={tautan}>Gabung</Link>
            </div>
        </div>
        <p className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 text-center font-label text-label-md text-outline">
            &copy; 2026 Creosphere.
        </p>
        </footer>
    );
}
