    "use client";

    import Link from "next/link";
    import { usePathname } from "next/navigation";
    import {
    LayoutDashboard, Palette, Upload, Bookmark, Trophy, UserCog, Settings,
    PlusCircle, Building2, UserCheck, ShieldAlert, Tags, Users,
    } from "lucide-react";

    const DAFTAR_MENU = {
    member: [
        { href: "/member", label: "Dashboard", ikon: LayoutDashboard },
        { href: "/member/artworks", label: "Karya Saya", ikon: Palette },
        { href: "/member/artworks/new", label: "Unggah Karya", ikon: Upload },
        { href: "/member/favorites", label: "Favorit Saya", ikon: Bookmark },
        { href: "/member/submissions", label: "Submisi Saya", ikon: Trophy },
        { href: "/member/profile", label: "Edit Profil", ikon: UserCog },
        { href: "/member/account", label: "Pengaturan Akun", ikon: Settings },
    ],
    curator: [
        { href: "/curator", label: "Dashboard Curator", ikon: LayoutDashboard },
        { href: "/curator/challenges", label: "Challenge Saya", ikon: Trophy },
        { href: "/curator/challenges/new", label: "Buat Challenge", ikon: PlusCircle },
        { href: "/curator/profile", label: "Profil Curator", ikon: Building2 },
    ],
    admin: [
        { href: "/admin", label: "Dashboard", ikon: LayoutDashboard },
        { href: "/admin/curators", label: "Persetujuan Curator", ikon: UserCheck, kunciLencana: "curator", warna: "peringatan" },
        { href: "/admin/moderation", label: "Antrean Moderasi", ikon: ShieldAlert, kunciLencana: "laporan", warna: "bahaya" },
        { href: "/admin/categories", label: "Kategori", ikon: Tags, kunciLencana: "kategori", warna: "netral" },
        { href: "/admin/users", label: "Manajemen Pengguna", ikon: Users },
    ],
    };

    const kelasAktif = {
    member: "bg-light-primary-container text-light-on-primary-container",
    curator: "bg-light-secondary-container text-light-on-secondary-container",
    admin: "bg-slate-800 text-white",
    };
    const kelasIkonAktif = { member: "text-light-primary", curator: "text-olive", admin: "text-terracotta" };
    const kelasBiasa = {
    member: "text-light-on-surface-variant hover:bg-warm-cream hover:text-light-on-surface",
    curator: "text-light-on-surface-variant hover:bg-warm-cream hover:text-light-on-surface",
    admin: "text-slate-300 hover:bg-slate-800 hover:text-white",
    };

    export default function MenuSidebar({ tema, lencana = {} }) {
    const pathname = usePathname();
    const daftar = DAFTAR_MENU[tema];

    let aktifHref = null;
    for (const item of daftar) {
        const cocok = pathname === item.href || pathname.startsWith(item.href + "/");
        if (cocok && (!aktifHref || item.href.length > aktifHref.length)) aktifHref = item.href;
    }

    return (
        <nav className="space-y-1.5" aria-label="Menu dashboard">
        {daftar.map((item) => {
            const aktif = item.href === aktifHref;
            const Ikon = item.ikon;
            const jumlah = item.kunciLencana ? lencana[item.kunciLencana] : 0;
            const kelasLencana =
            item.warna === "bahaya"
                ? "bg-rose-500/20 text-rose-300"
                : item.warna === "peringatan"
                ? "bg-amber-500/20 text-amber-300"
                : "bg-slate-700 text-slate-200";
            return (
            <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={
                "flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-DEFAULT font-medium text-body-sm transition-colors " +
                (aktif ? kelasAktif[tema] : kelasBiasa[tema])
                }
            >
                <span className="flex items-center gap-3">
                <Ikon className={"w-4 h-4 " + (aktif ? kelasIkonAktif[tema] : "")} />
                <span>{item.label}</span>
                </span>
                {jumlah > 0 && (
                <span className={"px-2 py-0.5 rounded-full text-xs font-bold " + kelasLencana}>{jumlah}</span>
                )}
            </Link>
            );
        })}
        </nav>
    );
    }
