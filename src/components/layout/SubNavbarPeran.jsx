"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Palette, Upload, Bookmark, Trophy, UserCog, PlusCircle, Building2 } from "lucide-react";

const MENU_PERAN = {
    member: [
        { href: "/member/artworks", label: "Karya Saya", ikon: Palette },
        { href: "/member/artworks/new", label: "Unggah Karya", ikon: Upload },
        { href: "/member/favorites", label: "Favorit Saya", ikon: Bookmark },
        { href: "/member/submissions", label: "Submisi Saya", ikon: Trophy },
        { href: "/member/profile", label: "Edit Profil", ikon: UserCog },
    ],
    curator: [
        { href: "/curator/challenges", label: "Challenge Saya", ikon: Trophy },
        { href: "/curator/challenges/new", label: "Buat Challenge", ikon: PlusCircle },
        { href: "/curator/profile", label: "Profil Curator", ikon: Building2 },
    ],
};

export default function SubNavbarPeran({ tema }) {
    const pathname = usePathname();
    const daftar = MENU_PERAN[tema] || [];

    let aktifHref = null;
    for (const item of daftar) {
        const cocok = pathname === item.href || pathname.startsWith(item.href + "/");
        if (cocok && (!aktifHref || item.href.length > aktifHref.length)) {
            aktifHref = item.href;
        }
    }

    return (
        <nav
            aria-label={tema === "member" ? "Menu Member" : "Menu Curator"}
            className="bg-surface-container-low border-b border-outline-variant"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
                {daftar.map((item) => {
                    const aktif = item.href === aktifHref;
                    const Ikon = item.ikon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={aktif ? "page" : undefined}
                            className={
                                "shrink-0 inline-flex items-center gap-2 px-3.5 py-3 text-body-sm border-b-2 whitespace-nowrap transition-colors duration-state-change " +
                                (aktif
                                    ? "border-primary text-primary font-semibold"
                                    : "border-transparent font-medium text-on-surface-variant hover:text-on-surface hover:border-outline")
                            }
                        >
                            <Ikon className={"w-4 h-4 " + (aktif ? "text-primary" : "")} aria-hidden="true" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}