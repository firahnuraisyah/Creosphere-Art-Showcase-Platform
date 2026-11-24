import Link from "next/link";
import { LogOut, ExternalLink, Menu, Home } from "lucide-react";
import { inisial } from "@/lib/format";
import Logo from "@/components/layout/Logo";
import MenuSidebar from "@/components/layout/MenuSidebar";

// Kerangka sidebar kiri dashboard
export default function SidebarDashboard({ tema, pengguna, lencana = {}, children }) {
    const tombolBeranda =
        "w-full py-2 px-3 rounded text-label-lg font-medium bg-surface border border-border-input text-on-surface hover:bg-surface-container-low flex items-center justify-center gap-2 transition-colors";

    const isi = (
        <>
        <div className="space-y-8">
            <Logo />
            <MenuSidebar tema={tema} lencana={lencana} />
        </div>

        <div className="pt-6 border-t border-outline-variant space-y-3">
            <Link href="/" className={tombolBeranda}>
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Kembali ke Beranda</span>
            </Link>

            <div className="flex items-center gap-3">
            {pengguna.avatar_url ? (
                <img src={pengguna.avatar_url} alt={pengguna.display_name} className="w-10 h-10 rounded-full object-cover border border-outline-variant" />
            ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-primary-container text-on-surface border border-outline-variant">
                {inisial(pengguna.display_name)}
                </div>
            )}
            <div className="truncate">
                <span className="font-headline text-title-md font-bold block truncate text-on-surface">{pengguna.display_name}</span>
                {tema === "member" && <span className="text-xs text-on-surface-variant">Seniman Member</span>}
                {tema === "curator" && (
                <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Curator Terverifikasi
                </span>
                )}
                {tema === "admin" && <span className="text-xs text-on-surface-variant block truncate">{pengguna.email}</span>}
            </div>
            </div>

            {tema === "member" && (
            <Link
                href={"/artists/" + pengguna.id}
                className="w-full py-1.5 px-3 rounded text-xs font-medium bg-surface-container-low hover:bg-surface-container border border-outline-variant text-on-surface flex items-center justify-center gap-1"
            >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Lihat Profil Publik</span>
            </Link>
            )}

            <form action="/api/logout" method="POST">
            <button type="submit" className="w-full py-1.5 px-3 text-xs rounded flex items-center justify-center gap-1 transition-colors text-danger hover:bg-rose-50">
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
            </button>
            </form>
        </div>
        </>
    );

    return (
        <div className="flex-1 flex flex-col lg:flex-row">
        <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between p-6 bg-surface border-r border-outline-variant lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
            {isi}
        </aside>

        <div className="lg:hidden sticky top-0 z-30 border-b bg-surface border-outline-variant">
            <details className="group">
            <summary className="flex items-center justify-between px-6 h-14 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <Logo />
                <span className="p-2 rounded text-on-surface" aria-label="Buka menu">
                <Menu className="w-5 h-5" />
                </span>
            </summary>
            <div className="p-6 space-y-6 bg-surface">
                <MenuSidebar tema={tema} lencana={lencana} />
                <Link href="/" className={tombolBeranda}>
                <Home className="w-4 h-4" aria-hidden="true" />
                <span>Kembali ke Beranda</span>
                </Link>
                <form action="/api/logout" method="POST">
                <button type="submit" className="w-full py-2 text-sm rounded flex items-center justify-center gap-1 text-danger hover:bg-rose-50">
                    <LogOut className="w-4 h-4" /> Keluar
                </button>
                </form>
            </div>
            </details>
        </div>

        <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10">{children}</main>
        </div>
    );
}
