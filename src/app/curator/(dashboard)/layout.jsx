import NavbarPublik from "@/components/layout/NavbarPublik";
import SubNavbarPeran from "@/components/layout/SubNavbarPeran";
import TombolKembali from "@/components/layout/TombolKembali";
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
                <TombolKembali bawaan={{ href: "/", label: "Beranda" }} />
            </div>
            {children}
        </main>
        <FooterPublik />
        </>
    );
}
