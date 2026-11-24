import Link from "next/link";
import { Search, Plus, ChevronDown, LayoutDashboard, User, Bookmark, LogOut } from "lucide-react";
import { ambilPengguna, tujuanDashboard } from "@/lib/auth";
import { inisial } from "@/lib/format";
import Logo from "@/components/layout/Logo";
import NavTautan from "@/components/layout/NavTautan";

const daftarMenu = [
    { href: "/", label: "Beranda" },
    { href: "/artworks", label: "Jelajahi" },
    { href: "/artists", label: "Komunitas", juga: ["/curators"] },
    { href: "/challenges", label: "Challenge" },
];

export default async function NavbarPublik() {
    const pengguna = await ambilPengguna();
    const dashboard = pengguna ? tujuanDashboard(pengguna.role, pengguna.status, pengguna.is_active) : null;
    const labelPeran = { member: "Seniman Member", curator: "Curator", admin: "Admin" };

    return (
        <header className="sticky top-0 z-40 bg-surface border-b border-outline-variant">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-6" aria-label="Navigasi utama">
                <NavTautan daftar={daftarMenu} />
            </nav>
            </div>

            <div className="flex items-center gap-3">
            {/* Pencarian global: GET ke /search?q=... (tanpa JavaScript) */}
            <form action="/search" method="GET" role="search" className="relative hidden lg:flex items-center w-64">
                <label htmlFor="cari-navbar" className="sr-only">Cari karya, seniman, kategori, atau challenge</label>
                <Search className="w-[18px] h-[18px] text-outline absolute left-3 pointer-events-none" aria-hidden="true" />
                <input
                id="cari-navbar" type="search" name="q" maxLength={100}
                placeholder="Cari karya, seniman, challenge..."
                className="w-full h-10 pl-9 pr-3 rounded bg-surface-container-low border border-border-input text-body-sm text-on-surface placeholder:text-outline focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary-container focus:outline-none transition-colors duration-state-change"
                />
            </form>
            <Link
                href="/search"
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded text-on-surface-variant hover:bg-surface-container transition-colors duration-state-change"
                aria-label="Cari"
            >
                <Search className="w-5 h-5" />
            </Link>

            {!pengguna && (
                <>
                <Link href="/login" className="hidden sm:inline-flex items-center justify-center h-10 px-3 rounded font-label text-label-lg text-on-surface-variant hover:bg-surface-container transition-colors duration-state-change">
                    Masuk
                </Link>
                <Link
                    href="/register"
                    className="inline-flex items-center justify-center h-10 px-4 rounded bg-primary text-on-primary font-label text-label-lg hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-state-change"
                >
                    <span className="sm:hidden">Gabung</span>
                    <span className="hidden sm:inline">Gabung Sekarang</span>
                </Link>
                </>
            )}

            {pengguna && (
                <>
                {pengguna.role === "member" && (
                    <Link
                    href="/member/artworks/new"
                    className="hidden sm:inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded bg-primary text-on-primary font-label text-label-lg hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors duration-state-change"
                    >
                    <Plus className="w-4 h-4" />
                    <span>Unggah Karya</span>
                    </Link>
                )}

                <details className="relative group">
                    <summary
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-warm-cream transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden"
                    aria-label="Menu akun"
                    >
                    {pengguna.avatar_url ? (
                        <img src={pengguna.avatar_url} alt={pengguna.display_name} className="w-8 h-8 rounded-full object-cover border border-sand" />
                    ) : (
                        <span className="w-8 h-8 rounded-full bg-light-primary-container text-light-on-primary-container flex items-center justify-center font-semibold text-xs border border-sand">
                        {inisial(pengguna.display_name)}
                        </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-light-on-surface-variant" />
                    </summary>
                    <div className="absolute right-0 top-full mt-2 w-56 z-50 bg-light-surface rounded-md border border-light-outline-variant shadow-lg py-2">
                    <div className="px-4 pb-2 mb-2 border-b border-light-outline-variant">
                        <span className="font-headline text-title-md font-bold text-light-on-surface block truncate">{pengguna.display_name}</span>
                        <span className="text-xs text-light-on-surface-variant">{labelPeran[pengguna.role]}</span>
                    </div>
                    <Link href={dashboard} className="flex items-center gap-2.5 px-4 py-2 text-body-sm text-light-on-surface hover:bg-warm-cream">
                        <LayoutDashboard className="w-4 h-4 text-light-on-surface-variant" />
                        Dashboard
                    </Link>
                    {pengguna.role === "member" && (
                        <>
                        <Link href={"/artists/" + pengguna.id} className="flex items-center gap-2.5 px-4 py-2 text-body-sm text-light-on-surface hover:bg-warm-cream">
                            <User className="w-4 h-4 text-light-on-surface-variant" />
                            Profil Publik Saya
                        </Link>
                        <Link href="/member/favorites" className="flex items-center gap-2.5 px-4 py-2 text-body-sm text-light-on-surface hover:bg-warm-cream">
                            <Bookmark className="w-4 h-4 text-light-on-surface-variant" />
                            Favorit Saya
                        </Link>
                        </>
                    )}
                    {pengguna.role === "curator" && pengguna.status === "approved" && (
                        <Link href={"/curators/" + pengguna.id} className="flex items-center gap-2.5 px-4 py-2 text-body-sm text-light-on-surface hover:bg-warm-cream">
                        <User className="w-4 h-4 text-light-on-surface-variant" />
                        Profil Publik Saya
                        </Link>
                    )}
                    <form action="/api/logout" method="POST" className="border-t border-light-outline-variant mt-2 pt-2">
                        <button type="submit" className="w-full flex items-center gap-2.5 px-4 py-2 text-body-sm text-danger hover:bg-rose-50">
                        <LogOut className="w-4 h-4" />
                        Keluar
                        </button>
                    </form>
                    </div>
                </details>
                </>
            )}
            </div>
        </div>

        <nav className="md:hidden border-t border-outline-variant" aria-label="Navigasi utama (ponsel)">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-6 overflow-x-auto scrollbar-none">
            <NavTautan daftar={daftarMenu} mobile />
            </div>
        </nav>
        </header>
    );
}
