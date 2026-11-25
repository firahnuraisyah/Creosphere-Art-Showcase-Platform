"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserCheck, ShieldAlert, Tags, Users } from "lucide-react";

const MENU_ADMIN = [
    { href: "/admin", label: "Dashboard", ikon: LayoutDashboard },
    { href: "/admin/curators", label: "Persetujuan Curator", ikon: UserCheck, kunciLencana: "curator", warna: "peringatan" },
    { href: "/admin/moderation", label: "Antrean Moderasi", ikon: ShieldAlert, kunciLencana: "laporan", warna: "bahaya" },
    { href: "/admin/categories", label: "Kategori", ikon: Tags, kunciLencana: "kategori", warna: "netral" },
    { href: "/admin/users", label: "Manajemen Pengguna", ikon: Users },
];

export default function MenuSidebar({ lencana = {} }) {
    const pathname = usePathname();

    let aktifHref = null;
    for (const item of MENU_ADMIN) {
        const cocok = pathname === item.href || pathname.startsWith(item.href + "/");
        if (cocok && (!aktifHref || item.href.length > aktifHref.length)) aktifHref = item.href;
    }

    return (
        <nav className="space-y-1.5" aria-label="Menu dashboard admin">
        {MENU_ADMIN.map((item) => {
            const aktif = item.href === aktifHref;
            const Ikon = item.ikon;
            const jumlah = item.kunciLencana ? lencana[item.kunciLencana] : 0;
            const kelasLencana =
            item.warna === "bahaya"
                ? "bg-rose-50 text-danger"
                : item.warna === "peringatan"
                ? "bg-amber-50 text-amber-700"
                : "bg-surface-container text-on-surface-variant";
            return (
            <Link
                key={item.href}
                href={item.href}
                aria-current={aktif ? "page" : undefined}
                className={
                "flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-DEFAULT font-medium text-body-sm transition-colors " +
                (aktif
                    ? "bg-primary-container text-on-surface"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface")
                }
            >
                <span className="flex items-center gap-3">
                <Ikon className={"w-4 h-4 " + (aktif ? "text-primary" : "")} />
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