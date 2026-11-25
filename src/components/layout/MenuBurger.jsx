"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

// Menu navigasi untuk layar kecil
export default function MenuBurger({ daftar }) {
    const [buka, setBuka] = useState(false);
    const pathname = usePathname();

    return (
        <div className="md:hidden">
            <button
                type="button"
                onClick={() => setBuka(!buka)}
                aria-expanded={buka}
                aria-controls="menu-burger"
                aria-label={buka ? "Tutup menu" : "Buka menu"}
                className="inline-flex items-center justify-center w-10 h-10 rounded text-on-surface-variant hover:bg-surface-container transition-colors duration-state-change"
            >
                {buka ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            {buka && (
                <nav id="menu-burger" aria-label="Navigasi utama (ponsel)" className="absolute left-0 right-0 top-full z-50 bg-surface border-b border-outline-variant shadow-md">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col">
                        {daftar.map((item) => {
                            const aktif = item.href === "/" ? pathname === "/" : [item.href, ...(item.juga || [])].some((h) => pathname.startsWith(h));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setBuka(false)}
                                    aria-current={aktif ? "page" : undefined}
                                    className={"py-3 font-label text-label-lg transition-colors duration-state-change " + (aktif ? "text-primary" : "text-on-surface-variant hover:text-on-surface")}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            )}
        </div>
    );
}
