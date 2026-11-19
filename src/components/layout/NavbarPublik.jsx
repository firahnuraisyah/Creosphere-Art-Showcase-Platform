    import Link from "next/link";
    import { Search, Plus, ChevronDown, LayoutDashboard, User, Bookmark, Settings, LogOut } from "lucide-react";
    import { ambilPengguna, tujuanDashboard } from "@/lib/auth";
    import { inisial } from "@/lib/format";
    import Logo from "@/components/layout/Logo";
    import NavTautan from "@/components/layout/NavTautan";

    const daftarMenu = [
    { href: "/", label: "Beranda" },
    { href: "/artworks", label: "Jelajahi Karya" },
    { href: "/artists", label: "Seniman" },
    { href: "/challenges", label: "Challenge" },
    ];

    export default async function NavbarPublik() {
    const pengguna = await ambilPengguna();
    const dashboard = pengguna ? tujuanDashboard(pengguna.role, pengguna.status) : null;
    const labelPeran = { member: "Seniman Member", curator: "Curator", admin: "Admin" };

    return (
        <header className="sticky top-0 z-40 bg-light-surface/95 backdrop-blur-md border-b border-light-outline-variant">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
            <Logo />

            <nav className="hidden md:flex items-center gap-8" aria-label="Navigasi utama">
            <NavTautan daftar={daftarMenu} />
            </nav>

            <div className="flex items-center gap-3">
            <Link
                href="/artworks"
                className="p-2 text-light-on-surface-variant hover:text-light-on-surface hover:bg-warm-cream rounded-full transition-colors"
                aria-label="Cari karya"
            >
                <Search className="w-5 h-5" />
            </Link>

            {!pengguna && (
                <>
                <Link href="/login" className="px-4 py-2 text-label-lg font-medium text-light-on-surface hover:text-light-primary transition-colors">
                    Masuk
                </Link>
                <Link
                    href="/register"
                    className="px-4 py-2 rounded-DEFAULT bg-light-primary text-light-on-primary text-label-lg font-medium hover:bg-[#6e3522] transition-colors shadow-sm"
                >
                    <span className="sm:hidden">Gabung</span>
                    <span className="hidden sm:inline">Gabung Creosphere</span>
                </Link>
                </>
            )}

            {pengguna && (
                <>
                {pengguna.role === "member" && (
                    <Link
                    href="/member/artworks/new"
                    className="hidden sm:inline-flex px-4 py-2 rounded-DEFAULT bg-light-primary text-light-on-primary text-label-lg font-medium hover:bg-[#6e3522] transition-colors shadow-sm items-center gap-1.5"
                    >
                    <Plus className="w-4 h-4" />
                    <span>Unggah</span>
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
                        <Link href="/member/account" className="flex items-center gap-2.5 px-4 py-2 text-body-sm text-light-on-surface hover:bg-warm-cream">
                            <Settings className="w-4 h-4 text-light-on-surface-variant" />
                            Pengaturan Akun
                        </Link>
                        </>
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

        <nav className="md:hidden border-t border-light-outline-variant" aria-label="Navigasi utama (ponsel)">
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center gap-6 overflow-x-auto scrollbar-none">
            <NavTautan daftar={daftarMenu} mobile />
            </div>
        </nav>
        </header>
    );
    }
