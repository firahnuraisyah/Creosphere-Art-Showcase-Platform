"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SubNavbarPeran({ tema, idPengguna = null }) {
    const pathname = usePathname();
    const daftar =
        tema === "member"
            ? [
                  { href: "/member/artworks", label: "Karya Saya" },
                  { href: "/member/artworks/new", label: "Unggah Karya" },
                  { href: "/member/favorites", label: "Favorit Saya" },
                  { href: "/member/submissions", label: "Submisi Saya" },
                  { href: "/member/profile", label: "Edit Profil" },
              ]
            : tema === "curator"
            ? [
                  ...(idPengguna ? [{ href: "/curators/" + idPengguna, label: "Profil Saya" }] : []),
                  { href: "/curator/challenges", label: "Challenge Saya" },
                  { href: "/curator/challenges/new", label: "Buat Challenge" },
              ]
            : [];

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
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={aktif ? "page" : undefined}
                            className={
                                "shrink-0 inline-flex items-center px-3.5 py-3 text-body-sm border-b-2 whitespace-nowrap transition-colors duration-state-change " +
                                (aktif
                                    ? "border-primary text-primary font-semibold"
                                    : "border-transparent font-medium text-on-surface-variant hover:text-on-surface hover:border-outline")
                            }
                        >
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
