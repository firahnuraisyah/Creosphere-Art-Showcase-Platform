import NavbarPublik from "@/components/layout/NavbarPublik";
import SubNavbarPeran from "@/components/layout/SubNavbarPeran";
import FooterPublik from "@/components/layout/FooterPublik";
import { wajibPeran } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Kerangka halaman member: navbar utama + menu member di bawah navbar
export default async function LayoutMember({ children }) {
    await wajibPeran(["member"]);
    return (
        <>
        <NavbarPublik />
        <SubNavbarPeran tema="member" />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            {children}
        </main>
        <FooterPublik />
        </>
    );
}