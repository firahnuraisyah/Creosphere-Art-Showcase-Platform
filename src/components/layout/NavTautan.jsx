"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavTautan({ daftar, mobile = false }) {
    const pathname = usePathname();

    return (
        <>
        {daftar.map((item) => {
            const aktif = item.href === "/" ? pathname === "/" : [item.href, ...(item.juga || [])].some((h) => pathname.startsWith(h));
            const dasar = "font-label text-label-lg whitespace-nowrap transition-colors duration-state-change ";
            const kelas = aktif
            ? dasar + "text-primary border-b-2 border-primary " + (mobile ? "py-2" : "py-5")
            : dasar + "text-on-surface-variant hover:text-on-surface " + (mobile ? "py-2" : "py-5");
            return (
            <Link key={item.href} href={item.href} className={kelas} aria-current={aktif ? "page" : undefined}>
                {item.label}
            </Link>
            );
        })}
        </>
    );
}
