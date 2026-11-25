import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NavbarPublik from "@/components/layout/NavbarPublik";
import SubNavbarPeran from "@/components/layout/SubNavbarPeran";
import FooterPublik from "@/components/layout/FooterPublik";
import { wajibPeran } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LayoutCurator({ children }) {
    const pengguna = await wajibPeran(["curator"], { harusDisetujui: true });
    return (
        <>
        <NavbarPublik />
        <SubNavbarPeran tema="curator" idPengguna={pengguna.id} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            <div className="mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 font-label text-label-lg text-on-surface-variant hover:text-on-surface hover:underline underline-offset-4"
                >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Kembali ke Beranda</span>
                </Link>
            </div>
            {children}
        </main>
        <FooterPublik />
        </>
    );
}
